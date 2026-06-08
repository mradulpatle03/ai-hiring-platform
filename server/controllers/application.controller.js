import mongoose from "mongoose";
import Application from "../models/application.model.js";
import Resume from "../models/resume.model.js";
import Job from "../models/job.model.js";
import { extractTextFromPDF } from "../services/pdf.service.js";
import { screeningQueue } from "../queues/screeningQueue.js";
import { generateEmbedding } from "../services/ai.service.js";
import { findSimilarJobs } from "../services/pinecone.service.js";

// Candidate: apply to a job
export const applyToJob = async (req, res) => {
  const { jobId } = req.body;

  // Check job exists and is open
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (job.status !== "open")
    return res.status(400).json({ message: "This job is closed" });

  // Check not already applied
  const existing = await Application.findOne({
    job: jobId,
    candidate: req.user._id,
  });
  if (existing)
    return res.status(400).json({ message: "You already applied to this job" });

  // Must have uploaded a file
  if (!req.file)
    return res.status(400).json({ message: "Resume PDF is required" });

  // Parse PDF text
  const parsedText = await extractTextFromPDF(req.file.path);

  // Save resume
  const resume = await Resume.create({
    candidate: req.user._id,
    fileUrl: req.file.path,
    fileName: req.file.originalname,
    parsedText,
  });

  // Create application
  const application = await Application.create({
    job: jobId,
    candidate: req.user._id,
    resume: resume._id,
    status: "pending",
  });

  // add to Bull Queue for AI screening here
  try {
    await screeningQueue.add(
      { applicationId: application._id.toString() },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
      },
    );
  } catch (queueErr) {
    console.error("Failed to queue screening job:", queueErr.message);
    // Don't fail the request — application is saved, screening will need retry
  }
  res.status(201).json({ success: true, application });
};

// Candidate: get their own applications
export const getMyApplications = async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate("job", "title company location status")
    .populate("resume", "fileName")
    .sort({ createdAt: -1 });

  res.json({ success: true, applications });
};

// Recruiter: get all applicants for a job
export const getJobApplicants = async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.jobId,
    recruiter: req.user._id,
  });
  if (!job)
    return res.status(404).json({ message: "Job not found or not yours" });

  const applications = await Application.find({ job: req.params.jobId })
    .populate("candidate", "name email github")
    .populate("resume", "fileName parsedText")
    .sort({ aiScore: -1 }); // sorted by AI score (null scores go last)

  res.json({ success: true, applications });
};

// Recruiter: update application status (shortlist / reject)
export const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ["shortlisted", "rejected"];
  if (!allowed.includes(status))
    return res.status(400).json({ message: "Invalid status" });

  const application = await Application.findById(req.params.id).populate("job");

  if (!application)
    return res.status(404).json({ message: "Application not found" });
  if (String(application.job.recruiter) !== String(req.user._id))
    return res.status(403).json({ message: "Not your job" });

  application.status = status;
  await application.save();
  res.json({ success: true, application });
};

export const getRecommendedJobs = async (req, res) => {
  // Get candidate's latest resume
  const latestResume = await Resume.findOne({ candidate: req.user._id }).sort({
    createdAt: -1,
  });

  if (!latestResume?.parsedText) return res.json({ success: true, jobs: [] });

  // Generate embedding for their resume
  const embedding = await generateEmbedding(latestResume.parsedText);

  // Find similar jobs from Pinecone
  const matches = await findSimilarJobs(embedding, 5);

  // Fetch actual job documents
  const jobIds = matches.map((m) => m.id.replace("job_", ""));
  const jobs = await Job.find({ _id: { $in: jobIds }, status: "open" });

  res.json({ success: true, jobs });
};

// ─── Recruiter: advanced search across all their applicants ──────────
export const searchApplicants = async (req, res) => {
  const {
    jobId,
    search,
    minScore,
    maxScore,
    skills,
    status,
    hasGitHub,
    sortBy = "score",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = req.query;

  // Get recruiter's job IDs
  let jobIds;
  if (jobId) {
    const job = await Job.findOne({ _id: jobId, recruiter: req.user._id });
    if (!job) return res.status(403).json({ message: "Not your job" });
    jobIds = [new mongoose.Types.ObjectId(jobId)];
  } else {
    const jobs = await Job.find({ recruiter: req.user._id }).select("_id");
    jobIds = jobs.map((j) => j._id);
  }

  if (jobIds.length === 0) {
    return res.json({
      success: true,
      applications: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      facets: {},
    });
  }

  // ── Build application-level match ──────────────────────────────────
  const appMatch = {
    job: { $in: jobIds },
  };

  if (minScore || maxScore) {
    appMatch.aiScore = {};
    if (minScore) appMatch.aiScore.$gte = Number(minScore);
    if (maxScore) appMatch.aiScore.$lte = Number(maxScore);
  }

  if (status) appMatch.status = status;

  if (skills) {
    const skillList = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (skillList.length > 0) {
      appMatch.aiMissingSkills = { $nin: skillList };
    }
  }

  // ── Sort config ─────────────────────────────────────────────────────
  const sortField =
    sortBy === "score"
      ? "aiScore"
      : sortBy === "date"
        ? "createdAt"
        : "createdAt";
  const sortDir = sortOrder === "asc" ? 1 : -1;

  // ── Main aggregation pipeline ───────────────────────────────────────
  const pipeline = [
    { $match: appMatch },

    // Join candidate user
    {
      $lookup: {
        from: "users",
        localField: "candidate",
        foreignField: "_id",
        as: "candidateData",
      },
    },
    { $unwind: "$candidateData" },

    // Join job
    {
      $lookup: {
        from: "jobs",
        localField: "job",
        foreignField: "_id",
        as: "jobData",
      },
    },
    { $unwind: "$jobData" },

    // Join resume
    {
      $lookup: {
        from: "resumes",
        localField: "resume",
        foreignField: "_id",
        as: "resumeData",
      },
    },
    { $unwind: { path: "$resumeData", preserveNullAndEmptyArrays: true } },
  ];

  // ── Apply candidate-level filters AFTER lookup ──────────────────────
  const postLookupMatch = {};

  if (search && search.trim()) {
    const regex = { $regex: search.trim(), $options: "i" };
    postLookupMatch.$or = [
      { "candidateData.name": regex },
      { "candidateData.email": regex },
    ];
  }

  if (hasGitHub === "true") {
    postLookupMatch["candidateData.github.connected"] = true;
  }

  if (Object.keys(postLookupMatch).length > 0) {
    pipeline.push({ $match: postLookupMatch });
  }

  // ── Shape output ────────────────────────────────────────────────────
  pipeline.push({
    $project: {
      _id: 1,
      status: 1,
      aiScore: 1,
      aiReasoning: 1,
      aiMissingSkills: 1,
      aiInterviewQuestions: 1,
      githubInsights: 1,
      embeddingScore: 1,
      createdAt: 1,
      xai: 1,
      candidate: {
        _id: "$candidateData._id",
        name: "$candidateData.name",
        email: "$candidateData.email",
        github: {
          connected: "$candidateData.github.connected",
          username: "$candidateData.github.username",
          topLanguages: "$candidateData.github.topLanguages",
          contributionScore: "$candidateData.github.contributionScore",
          totalStars: "$candidateData.github.totalStars",
        },
      },
      job: {
        _id: "$jobData._id",
        title: "$jobData.title",
        company: "$jobData.company",
      },
      resume: {
        fileName: "$resumeData.fileName",
      },
    },
  });

  // ── Sort ─────────────────────────────────────────────────────────────
  pipeline.push({ $sort: { [sortField]: sortDir } });

  // ── Count total before pagination ─────────────────────────────────
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await Application.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // ── Pagination ────────────────────────────────────────────────────
  pipeline.push({ $skip: (Number(page) - 1) * Number(limit) });
  pipeline.push({ $limit: Number(limit) });

  const applications = await Application.aggregate(pipeline);

  // ── Facets for sidebar counts ─────────────────────────────────────
  const facetPipeline = [
    { $match: appMatch },
    {
      $facet: {
        statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        scoreRanges: [
          {
            $bucket: {
              groupBy: "$aiScore",
              boundaries: [0, 25, 50, 75, 101],
              default: "unscored",
              output: { count: { $sum: 1 } },
            },
          },
        ],
        topMissingSkills: [
          { $unwind: "$aiMissingSkills" },
          {
            $group: {
              _id: { $toLower: "$aiMissingSkills" },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 15 },
        ],
      },
    },
  ];

  const [facets] = await Application.aggregate(facetPipeline);

  res.json({
    success: true,
    applications,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
    facets: facets || {},
  });
};

// Get full XAI breakdown for one application
export const getXAIBreakdown = async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("candidate", "name email github")
    .populate("job", "title company skillsRequired")
    .populate("resume", "fileName");

  if (!application)
    return res.status(404).json({ message: "Application not found" });

  // Recruiter must own the job
  const job = await Job.findById(application.job);
  if (String(job.recruiter) !== String(req.user._id))
    return res.status(403).json({ message: "Access denied" });

  res.json({ success: true, application });
};
