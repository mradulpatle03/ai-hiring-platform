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
  await screeningQueue.add(
    { applicationId: application._id.toString() },
    {
      attempts: 3, // retry up to 3 times on failure
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: true,
    },
  );
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
    .populate("candidate", "name email")
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
    search, // candidate name or email
    minScore,
    maxScore,
    skills, // comma-separated: "React,Node.js"
    recommendation, // shortlist | maybe | reject
    status, // screened | shortlisted | rejected | pending
    hasGitHub,
    sortBy, // score | date | name
    sortOrder, // asc | desc
    page = 1,
    limit = 20,
  } = req.query;

  // Verify recruiter owns the job (if jobId provided)
  if (jobId) {
    const job = await Job.findOne({ _id: jobId, recruiter: req.user._id });
    if (!job) return res.status(403).json({ message: "Not your job" });
  } else {
    // Get all recruiter job IDs
    const jobs = await Job.find({ recruiter: req.user._id }).select("_id");
    req.jobIds = jobs.map((j) => j._id);
  }

  // ── Build MongoDB filter ────────────────────────────────────────────
  const appFilter = {};

  // Scope to job(s)
  appFilter.job = jobId
    ? new mongoose.Types.ObjectId(jobId)
    : { $in: req.jobIds };

  // Score range
  if (minScore || maxScore) {
    appFilter.aiScore = {};
    if (minScore) appFilter.aiScore.$gte = Number(minScore);
    if (maxScore) appFilter.aiScore.$lte = Number(maxScore);
  }

  // Status
  if (status) appFilter.status = status;

  // Skills filter — candidate must be MISSING none of the required skills
  // (i.e. skills that matched, not missing)
  // We filter by matched skills stored in the AI output
  if (skills) {
    const skillList = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (skillList.length > 0) {
      appFilter.aiMissingSkills = { $nin: skillList };
    }
  }

  // ── Candidate-level filters (need lookup) ───────────────────────────
  const candidateFilter = {};
  if (search) {
    candidateFilter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (hasGitHub === "true") {
    candidateFilter["github.connected"] = true;
  }

  // ── Sort ────────────────────────────────────────────────────────────
  const sortMap = {
    score: { aiScore: sortOrder === "asc" ? 1 : -1 },
    date: { createdAt: sortOrder === "asc" ? 1 : -1 },
    name: {}, // handled after populate
  };
  const sort = sortMap[sortBy] || { aiScore: -1 };

  // ── Aggregation pipeline ────────────────────────────────────────────
  const pipeline = [
    { $match: appFilter },

    // Join candidate
    {
      $lookup: {
        from: "users",
        localField: "candidate",
        foreignField: "_id",
        as: "candidateData",
      },
    },
    { $unwind: "$candidateData" },

    // Apply candidate-level filter
    ...(Object.keys(candidateFilter).length > 0
      ? [{ $match: candidateFilter }]
      : []),

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

    // Shape output
    {
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
    },

    // Sort
    { $sort: sort },
  ];

  // Get total count before pagination
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await Application.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Apply pagination
  pipeline.push({ $skip: (Number(page) - 1) * Number(limit) });
  pipeline.push({ $limit: Number(limit) });

  const applications = await Application.aggregate(pipeline);

  // Sort by name post-aggregation (MongoDB collation needed otherwise)
  if (sortBy === "name") {
    applications.sort((a, b) => {
      const cmp = a.candidate.name.localeCompare(b.candidate.name);
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }

  // ── Compute filter facets (counts for each filter option) ───────────
  const facetPipeline = [
    { $match: appFilter },
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
    facets,
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
