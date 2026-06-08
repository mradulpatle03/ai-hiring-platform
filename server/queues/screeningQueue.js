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

// ─── Parse Redis URL for Upstash TLS support ─────────────────────────
const buildRedisConfig = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  // Upstash uses rediss:// (with double s) for TLS
  if (redisUrl.startsWith('rediss://')) {
    const url = new URL(redisUrl)
    return {
      redis: {
        host:               url.hostname,
        port:               Number(url.port) || 6380,
        username:           url.username || 'default',
        password:           decodeURIComponent(url.password),
        tls:                {},             // enable TLS for Upstash
        maxRetriesPerRequest: 3,
        enableReadyCheck:   false,
        connectTimeout:     30000,
        lazyConnect:        true,
      }
    }
  }

  // Local Redis — plain connection
  return {
    redis: {
      host:               'localhost',
      port:               6379,
      maxRetriesPerRequest: 3,
      enableReadyCheck:   false,
      lazyConnect:        true,
    }
  }
}


export const screeningQueue = new Bull('resume-screening', {
  ...buildRedisConfig(),
  defaultJobOptions: {
    attempts:    3,
    backoff:     { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail:     false,
  },
})

screeningQueue.process(async (job) => {
  const { applicationId } = job.data
  console.log(`\n🔄 Starting screening for application: ${applicationId}`)

  let application
  try {
    application = await Application.findById(applicationId)
    if (!application) {
      console.error(`❌ Application not found: ${applicationId}`)
      throw new Error('Application not found')
    }

    const resume    = await Resume.findById(application.resume)
    const jobDoc    = await Job.findById(application.job)
    const candidate = await User.findById(application.candidate)

    if (!resume) {
      console.error(`❌ Resume not found for application: ${applicationId}`)
      throw new Error('Resume not found')
    }
    if (!jobDoc) {
      console.error(`❌ Job not found for application: ${applicationId}`)
      throw new Error('Job not found')
    }

    console.log(`📄 Resume text length: ${resume.parsedText?.length || 0} chars`)
    console.log(`💼 Job: ${jobDoc.title}`)
    console.log(`👤 Candidate: ${candidate?.name}`)

    application.status = 'screening'
    await application.save()
    console.log(`✅ Status set to screening`)

    const githubSummary = buildGitHubSummary(candidate?.github)
    console.log(`🐙 GitHub connected: ${!!githubSummary}`)

    // Step 1 — Standard scoring
    console.log(`🤖 Step 1: Running standard AI scoring...`)
    let scoreResult
    try {
      scoreResult = githubSummary
        ? await scoreResumeWithGitHub(resume.parsedText, jobDoc.description, jobDoc.skillsRequired, githubSummary)
        : await scoreResume(resume.parsedText, jobDoc.description, jobDoc.skillsRequired)
      console.log(`✅ Standard score: ${scoreResult.score}`)
    } catch (err) {
      console.error(`❌ Standard scoring failed: ${err.message}`)
      throw err
    }

    // Step 2 — XAI scoring
    console.log(`🤖 Step 2: Running XAI scoring...`)
    let xaiResult
    try {
      xaiResult = await scoreResumeXAI(
        resume.parsedText,
        jobDoc.description,
        jobDoc.skillsRequired,
        githubSummary
      )
      console.log(`✅ XAI overall score: ${xaiResult.overallScore}`)
    } catch (err) {
      console.error(`❌ XAI scoring failed: ${err.message}`)
      // XAI failure is non-fatal — use standard score only
      xaiResult = null
    }

    // Step 3 — Interview questions
    console.log(`🤖 Step 3: Generating interview questions...`)
    let questions = []
    try {
      questions = await generateInterviewQuestions(resume.parsedText, jobDoc.description)
      console.log(`✅ Generated ${questions.length} questions`)
    } catch (err) {
      console.error(`❌ Interview questions failed: ${err.message}`)
      // Non-fatal — continue without questions
    }

    // Step 4 — Embeddings
    console.log(`🔢 Step 4: Generating embeddings...`)
    let embeddingScore = 0
    try {
      const resumeEmbedding = await generateEmbedding(resume.parsedText)
      await upsertResumeEmbedding(resume._id.toString(), resumeEmbedding, {
        candidateId: application.candidate.toString(),
        jobId:       application.job.toString(),
      })
      const similar  = await findSimilarResumes(resumeEmbedding, 1)
      embeddingScore = similar.find(r => r.id === `resume_${resume._id}`)?.score || 0
      console.log(`✅ Embedding score: ${embeddingScore}`)
    } catch (err) {
      console.error(`❌ Embedding failed (non-fatal): ${err.message}`)
      // Non-fatal — continue with 0 embedding score
    }

    // Step 5 — Calculate final score
    const xaiScore   = xaiResult?.overallScore || scoreResult.score
    const finalScore = Math.min(100, Math.max(0, Math.round(
      xaiScore       * 0.60 +
      scoreResult.score * 0.30 +
      embeddingScore    * 10
    )))
    console.log(`📊 Final score: ${finalScore} (xai:${xaiScore} standard:${scoreResult.score} embedding:${embeddingScore})`)

    // Step 6 — Save results
    application.aiScore              = finalScore
    application.aiReasoning          = scoreResult.reasoning
    application.aiMissingSkills      = scoreResult.missingSkills  || []
    application.aiInterviewQuestions = questions
    application.embeddingScore       = embeddingScore
    application.githubInsights       = scoreResult.githubInsights || null

    if (xaiResult?.dimensions) {
      application.xai = {
        dimensions:    xaiResult.dimensions,
        summary:       xaiResult.summary,
        topStrengths:  xaiResult.topStrengths   || [],
        criticalGaps:  xaiResult.criticalGaps   || [],
        interviewFocus:xaiResult.interviewFocus || [],
      }
    }

    application.status = 'screened'
    await application.save()

    console.log(`\n✅ Screening complete for ${applicationId} — score: ${finalScore}\n`)
    return { applicationId, score: finalScore }

  } catch (err) {
    console.error(`\n❌ Screening FAILED for ${applicationId}: ${err.message}`)
    console.error(err.stack)

    // Reset status so it can be retried
    if (application) {
      application.status = 'pending'
      await application.save().catch(e => console.error('Failed to reset status:', e.message))
    }
    throw err
  }
})

screeningQueue.on("failed", (job, err) =>
  console.error(`Queue failed ${job.id}:`, err.message),
);
screeningQueue.on("completed", (job, result) =>
  console.log(`Queue completed ${job.id}:`, result),
);
screeningQueue.on('error', (err) => {
  console.error('Queue error:', err.message)
})

screeningQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} waiting in queue`)
})