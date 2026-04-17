import Bull   from 'bull'
import Application from '../models/application.model.js'
import Resume      from '../models/resume.model.js'
import Job         from '../models/job.model.js'
import { scoreResume, generateInterviewQuestions, generateEmbedding } from '../services/ai.service.js'
import { upsertResumeEmbedding, findSimilarResumes } from '../services/pinecone.service.js'

// Create the queue (connects to Redis)
export const screeningQueue = new Bull('resume-screening', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379'
})

const isRetryableAIError = (err) => {
  const status = err?.status
  const message = `${err?.message || ''}`.toLowerCase()

  return (
    [408, 429, 500, 502, 503, 504].includes(status) ||
    message.includes('service unavailable') ||
    message.includes('high demand') ||
    message.includes('overloaded') ||
    message.includes('timeout') ||
    message.includes('timed out')
  )
}

// Worker — processes each job in the queue
screeningQueue.process(async (job) => {
  const { applicationId } = job.data
  console.log(`Processing application: ${applicationId}`)

  // 1. Load all related data
  const application = await Application.findById(applicationId)
  if (!application) throw new Error('Application not found')

  const resume      = await Resume.findById(application.resume)
  const jobDoc      = await Job.findById(application.job)

  if (!resume || !jobDoc) throw new Error('Resume or job not found')

  try {
    // 2. Update status to 'screening'
    application.status = 'screening'
    await application.save()

    // 3. Score resume with LLM
    const scoreResult = await scoreResume(
      resume.parsedText,
      jobDoc.description,
      jobDoc.skillsRequired
    )

    // 4. Generate interview questions
    const questions = await generateInterviewQuestions(
      resume.parsedText,
      jobDoc.description
    )

    // 5. Generate resume embedding + store in Pinecone
    const resumeEmbedding = await generateEmbedding(resume.parsedText)
    await upsertResumeEmbedding(resume._id.toString(), resumeEmbedding, {
      candidateId: application.candidate.toString(),
      jobId:       application.job.toString(),
    })

    // 6. Get semantic similarity score against this job's embedding
    //    (job embedding was stored when job was created)
    const similarResumes   = await findSimilarResumes(resumeEmbedding, 1)
    const embeddingScore   = similarResumes.find(
      r => r.id === `resume_${resume._id}`
    )?.score || 0

    // 7. Combine LLM score + embedding score into final score
    //    70% LLM reasoning + 30% semantic similarity
    const finalScore = Math.round(
      scoreResult.score * 0.7 + embeddingScore * 100 * 0.3
    )

    // 8. Save everything back to application
    application.aiScore              = finalScore
    application.aiReasoning          = scoreResult.reasoning
    application.aiMissingSkills      = scoreResult.missingSkills
    application.aiInterviewQuestions = questions
    application.embeddingScore       = embeddingScore
    application.status               = 'screened'
    await application.save()

    console.log(`Screened application ${applicationId} — score: ${finalScore}`)
    return { applicationId, score: finalScore }

  } catch (err) {
    // Temporary provider outages should not make the application look broken.
    application.status = 'pending'
    await application.save()

    if (isRetryableAIError(err)) {
      console.warn(
        `Screening deferred for application ${applicationId}: ${err.message}`
      )
      return {
        applicationId,
        deferred: true,
        reason: 'temporary_ai_unavailable',
      }
    }

    throw err
  }
})

// Queue event listeners 
screeningQueue.on('failed', (job, err) => {
  console.error(`Queue job ${job.id} failed:`, err.message)
})

screeningQueue.on('completed', (job, result) => {
  console.log(`Queue job ${job.id} completed:`, result)
})
