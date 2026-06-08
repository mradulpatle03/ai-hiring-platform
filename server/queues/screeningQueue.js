import Bull from "bull";
import Application from "../models/application.model.js";
import Resume from "../models/resume.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import {
  scoreResume,
  scoreResumeWithGitHub,
  scoreResumeXAI,
  generateInterviewQuestions,
  generateEmbedding,
} from "../services/ai.service.js";
import { buildGitHubSummary } from "../services/github.service.js";
import {
  upsertResumeEmbedding,
  findSimilarResumes,
} from "../services/pinecone.service.js";

// Direct processing — used when Bull Queue is unavailable
const processApplicationDirectly = async (applicationId) => {
  console.log(`\n🔄 Direct processing: ${applicationId}`)
  let application

  try {
    application = await Application.findById(applicationId)
    if (!application) throw new Error('Application not found')

    const resume    = await Resume.findById(application.resume)
    const jobDoc    = await Job.findById(application.job)
    const candidate = await User.findById(application.candidate)

    if (!resume || !jobDoc) throw new Error('Resume or job not found')
    if (!resume.parsedText || resume.parsedText.length < 20)
      throw new Error('Resume text too short')

    application.status = 'screening'
    await application.save()

    const githubSummary = buildGitHubSummary(candidate?.github)

    console.log('🤖 Step 1: Standard scoring...')
    const scoreResult = githubSummary
      ? await scoreResumeWithGitHub(resume.parsedText, jobDoc.description, jobDoc.skillsRequired, githubSummary)
      : await scoreResume(resume.parsedText, jobDoc.description, jobDoc.skillsRequired)
    console.log(`✅ Standard score: ${scoreResult.score}`)

    console.log('🤖 Step 2: XAI scoring...')
    let xaiResult = null
    try {
      xaiResult = await scoreResumeXAI(resume.parsedText, jobDoc.description, jobDoc.skillsRequired, githubSummary)
      console.log(`✅ XAI score: ${xaiResult.overallScore}`)
    } catch (err) {
      console.error(`⚠️  XAI failed: ${err.message}`)
    }

    console.log('🤖 Step 3: Interview questions...')
    let questions = []
    try {
      questions = await generateInterviewQuestions(resume.parsedText, jobDoc.description)
      console.log(`✅ ${questions.length} questions`)
    } catch (err) {
      console.error(`⚠️  Questions failed: ${err.message}`)
    }

    console.log('🔢 Step 4: Embeddings...')
    let embeddingScore = 0
    try {
      const embedding = await generateEmbedding(resume.parsedText)
      await upsertResumeEmbedding(resume._id.toString(), embedding, {
        candidateId: application.candidate.toString(),
        jobId:       application.job.toString(),
      })
      const similar  = await findSimilarResumes(embedding, 1)
      embeddingScore = similar.find(r => r.id === `resume_${resume._id}`)?.score || 0
      console.log(`✅ Embedding: ${embeddingScore}`)
    } catch (err) {
      console.error(`⚠️  Embeddings failed: ${err.message}`)
    }

    const xaiScore   = xaiResult?.overallScore ?? scoreResult.score
    const finalScore = Math.min(100, Math.max(0, Math.round(
      xaiScore          * 0.60 +
      scoreResult.score * 0.30 +
      embeddingScore    * 10
    )))

    application.aiScore              = finalScore
    application.aiReasoning          = scoreResult.reasoning       || ''
    application.aiMissingSkills      = scoreResult.missingSkills   || []
    application.aiInterviewQuestions = questions
    application.embeddingScore       = embeddingScore
    application.githubInsights       = scoreResult.githubInsights  || null

    if (xaiResult?.dimensions) {
      application.xai = {
        dimensions:    xaiResult.dimensions,
        summary:       xaiResult.summary        || '',
        topStrengths:  xaiResult.topStrengths   || [],
        criticalGaps:  xaiResult.criticalGaps   || [],
        interviewFocus:xaiResult.interviewFocus || [],
      }
    }

    application.status = 'screened'
    await application.save()

    console.log(`\n✅ Direct processing complete — score: ${finalScore}\n`)
  } catch (err) {
    console.error(`❌ Direct processing failed: ${err.message}`)
    if (application) {
      application.status = 'pending'
      await application.save().catch(() => {})
    }
  }
}

// ─── Redis config with Upstash TLS support ────────────────────────────
const buildRedisConfig = () => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  if (redisUrl.startsWith("rediss://")) {
    const url = new URL(redisUrl);
    return {
      redis: {
        host: url.hostname,
        port: Number(url.port) || 6380,
        username: url.username || "default",
        password: decodeURIComponent(url.password),
        tls: {},
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        connectTimeout: 30000,
        lazyConnect: true,
      },
    };
  }

  return {
    redis: {
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
    },
  };
};



export const screeningQueue = new Bull("resume-screening", {
  ...buildRedisConfig(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
// ─── Test connection on startup ───────────────────────────────────────
screeningQueue
  .isReady()
  .then(() => {
    console.log("✅ Screening queue connected to Redis");
  })
  .catch((err) => {
    console.error("❌ Screening queue failed to connect:", err.message);
  });

// ─── Handle stalled jobs (Render free tier spins down) ───────────────
screeningQueue.on("stalled", (job) => {
  console.log(`⚠️  Job ${job.id} stalled — reprocessing`);
});

// ─── Worker ───────────────────────────────────────────────────────────
screeningQueue.process(async (job) => {
  const { applicationId } = job.data;
  console.log(`\n🔄 Starting screening: ${applicationId}`);

  let application;
  try {
    application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    const resume = await Resume.findById(application.resume);
    const jobDoc = await Job.findById(application.job);
    const candidate = await User.findById(application.candidate);

    if (!resume) throw new Error("Resume not found");
    if (!jobDoc) throw new Error("Job not found");

    console.log(`📄 Resume text: ${resume.parsedText?.length || 0} chars`);
    console.log(`💼 Job: ${jobDoc.title}`);
    console.log(`👤 Candidate: ${candidate?.name}`);

    if (!resume.parsedText || resume.parsedText.length < 20) {
      throw new Error(
        "Resume has no parsed text — PDF may be image-based or corrupted",
      );
    }

    application.status = "screening";
    await application.save();

    const githubSummary = buildGitHubSummary(candidate?.github);

    // Step 1 — Standard scoring
    console.log("🤖 Step 1: Standard scoring...");
    const scoreResult = githubSummary
      ? await scoreResumeWithGitHub(
          resume.parsedText,
          jobDoc.description,
          jobDoc.skillsRequired,
          githubSummary,
        )
      : await scoreResume(
          resume.parsedText,
          jobDoc.description,
          jobDoc.skillsRequired,
        );
    console.log(`✅ Standard score: ${scoreResult.score}`);

    // Step 2 — XAI scoring
    console.log("🤖 Step 2: XAI scoring...");
    let xaiResult = null;
    try {
      xaiResult = await scoreResumeXAI(
        resume.parsedText,
        jobDoc.description,
        jobDoc.skillsRequired,
        githubSummary,
      );
      console.log(`✅ XAI score: ${xaiResult.overallScore}`);
    } catch (err) {
      console.error(`⚠️  XAI failed (non-fatal): ${err.message}`);
    }

    // Step 3 — Interview questions
    console.log("🤖 Step 3: Interview questions...");
    let questions = [];
    try {
      questions = await generateInterviewQuestions(
        resume.parsedText,
        jobDoc.description,
      );
      console.log(`✅ ${questions.length} questions generated`);
    } catch (err) {
      console.error(`⚠️  Questions failed (non-fatal): ${err.message}`);
    }

    // Step 4 — Embeddings
    console.log("🔢 Step 4: Embeddings...");
    let embeddingScore = 0;
    try {
      const embedding = await generateEmbedding(resume.parsedText);
      await upsertResumeEmbedding(resume._id.toString(), embedding, {
        candidateId: application.candidate.toString(),
        jobId: application.job.toString(),
      });
      const similar = await findSimilarResumes(embedding, 1);
      embeddingScore =
        similar.find((r) => r.id === `resume_${resume._id}`)?.score || 0;
      console.log(`✅ Embedding score: ${embeddingScore}`);
    } catch (err) {
      console.error(`⚠️  Embeddings failed (non-fatal): ${err.message}`);
    }

    // Step 5 — Final score
    const xaiScore = xaiResult?.overallScore ?? scoreResult.score;
    const finalScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          xaiScore * 0.6 + scoreResult.score * 0.3 + embeddingScore * 10,
        ),
      ),
    );
    console.log(
      `📊 Final: ${finalScore} (xai:${xaiScore} std:${scoreResult.score} emb:${embeddingScore})`,
    );

    // Step 6 — Save
    application.aiScore = finalScore;
    application.aiReasoning = scoreResult.reasoning || "";
    application.aiMissingSkills = scoreResult.missingSkills || [];
    application.aiInterviewQuestions = questions;
    application.embeddingScore = embeddingScore;
    application.githubInsights = scoreResult.githubInsights || null;

    if (xaiResult?.dimensions) {
      application.xai = {
        dimensions: xaiResult.dimensions,
        summary: xaiResult.summary || "",
        topStrengths: xaiResult.topStrengths || [],
        criticalGaps: xaiResult.criticalGaps || [],
        interviewFocus: xaiResult.interviewFocus || [],
      };
    }

    application.status = "screened";
    await application.save();

    console.log(`\n✅ Screening complete — score: ${finalScore}\n`);
    return { applicationId, score: finalScore };
  } catch (err) {
    console.error(`\n❌ Screening FAILED: ${err.message}`);
    if (application) {
      application.status = "pending";
      await application.save().catch(() => {});
    }
    throw err;
  }
});

screeningQueue.on("failed", (job, err) =>
  console.error(`Queue job ${job.id} failed: ${err.message}`),
);
screeningQueue.on("completed", (job, res) =>
  console.log(`Queue job ${job.id} done:`, res),
);
screeningQueue.on("error", (err) => console.error("Queue error:", err.message));
