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

export const screeningQueue = new Bull("resume-screening", {
  redis: process.env.REDIS_URL || "redis://localhost:6379",
});

screeningQueue.process(async (job) => {
  const { applicationId } = job.data;

  const application = await Application.findById(applicationId);
  if (!application) throw new Error("Application not found");

  const resume = await Resume.findById(application.resume);
  const jobDoc = await Job.findById(application.job);
  const candidate = await User.findById(application.candidate);

  if (!resume || !jobDoc) throw new Error("Resume or job not found");

  try {
    application.status = "screening";
    await application.save();

    const githubSummary = buildGitHubSummary(candidate?.github);

    // Run standard scoring + XAI scoring in parallel
    const [scoreResult, xaiResult, questions] = await Promise.all([
      githubSummary
        ? scoreResumeWithGitHub(
            resume.parsedText,
            jobDoc.description,
            jobDoc.skillsRequired,
            githubSummary,
          )
        : scoreResume(
            resume.parsedText,
            jobDoc.description,
            jobDoc.skillsRequired,
          ),
      scoreResumeXAI(
        resume.parsedText,
        jobDoc.description,
        jobDoc.skillsRequired,
        githubSummary,
      ),
      generateInterviewQuestions(resume.parsedText, jobDoc.description),
    ]);

    // Embedding for similarity
    const resumeEmbedding = await generateEmbedding(resume.parsedText);

    let embeddingScore = 0;
    try {
      await upsertResumeEmbedding(resume._id.toString(), resumeEmbedding, {
        candidateId: application.candidate.toString(),
        jobId: application.job.toString(),
      });
      const similar = await findSimilarResumes(resumeEmbedding, 1);
      embeddingScore =
        similar.find((r) => r.id === `resume_${resume._id}`)?.score || 0;
    } catch (e) {
      console.warn(
        "Pinecone unavailable, skipping embedding score:",
        e.message,
      );
    }

    const finalScore = Math.round(
      (xaiResult.overallScore / 10) * 70 + // XAI score (0-10 → 0-70)
        scoreResult.score * 0.2 + // Standard LLM score (0-100 → 0-20)
        embeddingScore * 10, // Semantic similarity (0-1 → 0-10)
    );

    // Save everything
    application.aiScore = Math.min(100, finalScore);
    application.aiReasoning = scoreResult.reasoning;
    application.aiMissingSkills = scoreResult.missingSkills || [];
    application.aiInterviewQuestions = questions;
    application.embeddingScore = embeddingScore;
    application.githubInsights = scoreResult.githubInsights || null;

    // Save XAI data
    application.xai = {
      dimensions: xaiResult.dimensions,
      summary: xaiResult.summary,
      topStrengths: xaiResult.topStrengths || [],
      criticalGaps: xaiResult.criticalGaps || [],
      interviewFocus: xaiResult.interviewFocus || [],
    };

    application.status = "screened";
    await application.save();

    console.log(
      `✅ XAI screened ${applicationId} — score: ${application.aiScore}`,
    );
    return { applicationId, score: application.aiScore };
  } catch (err) {
    application.status = "pending";
    await application.save();
    console.error("Screening failed:", err.message);
    throw err;
  }
});

screeningQueue.on("failed", (job, err) =>
  console.error(`Queue failed ${job.id}:`, err.message),
);
screeningQueue.on("completed", (job, result) =>
  console.log(`Queue completed ${job.id}:`, result),
);
