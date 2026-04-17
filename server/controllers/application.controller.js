import Application from '../models/application.model.js'
import Resume      from '../models/resume.model.js'
import Job         from '../models/job.model.js'
import { extractTextFromPDF } from '../services/pdf.service.js'
import { screeningQueue } from '../queues/screeningQueue.js'
import { generateEmbedding } from '../services/ai.service.js'
import { findSimilarJobs }   from '../services/pinecone.service.js'

// Candidate: apply to a job
export const applyToJob = async (req, res) => {
  const { jobId } = req.body

  // Check job exists and is open
  const job = await Job.findById(jobId)
  if (!job)               return res.status(404).json({ message: 'Job not found' })
  if (job.status !== 'open') return res.status(400).json({ message: 'This job is closed' })

  // Check not already applied
  const existing = await Application.findOne({ job: jobId, candidate: req.user._id })
  if (existing) return res.status(400).json({ message: 'You already applied to this job' })

  // Must have uploaded a file
  if (!req.file) return res.status(400).json({ message: 'Resume PDF is required' })

  // Parse PDF text
  const parsedText = await extractTextFromPDF(req.file.path)

  // Save resume
  const resume = await Resume.create({
    candidate: req.user._id,
    fileUrl:   req.file.path,
    fileName:  req.file.originalname,
    parsedText,
  })

  // Create application
  const application = await Application.create({
    job:       jobId,
    candidate: req.user._id,
    resume:    resume._id,
    status:    'pending',
  })

  // add to Bull Queue for AI screening here
  await screeningQueue.add(
  { applicationId: application._id.toString() },
  {
    attempts: 3,                    // retry up to 3 times on failure
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
  }
)
  res.status(201).json({ success: true, application })
}

// Candidate: get their own applications
export const getMyApplications = async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate('job', 'title company location status')
    .populate('resume', 'fileName')
    .sort({ createdAt: -1 })

  res.json({ success: true, applications })
}

// Recruiter: get all applicants for a job
export const getJobApplicants = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user._id })
  if (!job) return res.status(404).json({ message: 'Job not found or not yours' })

  const applications = await Application.find({ job: req.params.jobId })
    .populate('candidate', 'name email')
    .populate('resume', 'fileName parsedText')
    .sort({ aiScore: -1 }) // sorted by AI score (null scores go last)

  res.json({ success: true, applications })
}

// Recruiter: update application status (shortlist / reject)
export const updateApplicationStatus = async (req, res) => {
  const { status } = req.body
  const allowed = ['shortlisted', 'rejected']
  if (!allowed.includes(status))
    return res.status(400).json({ message: 'Invalid status' })

  const application = await Application.findById(req.params.id)
    .populate('job')

  if (!application) return res.status(404).json({ message: 'Application not found' })
  if (String(application.job.recruiter) !== String(req.user._id))
    return res.status(403).json({ message: 'Not your job' })

  application.status = status
  await application.save()
  res.json({ success: true, application })
}

export const getRecommendedJobs = async (req, res) => {
  // Get candidate's latest resume
  const latestResume = await Resume.findOne({ candidate: req.user._id })
    .sort({ createdAt: -1 })

  if (!latestResume?.parsedText)
    return res.json({ success: true, jobs: [] })

  // Generate embedding for their resume
  const embedding = await generateEmbedding(latestResume.parsedText)

  // Find similar jobs from Pinecone
  const matches = await findSimilarJobs(embedding, 5)

  // Fetch actual job documents
  const jobIds = matches.map(m => m.id.replace('job_', ''))
  const jobs   = await Job.find({ _id: { $in: jobIds }, status: 'open' })

  res.json({ success: true, jobs })
}