import Application from "../models/application.model.js";
import Resume from "../models/resume.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { extractTextFromBuffer } from "../services/pdf.service.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { screeningQueue } from "../queues/screeningQueue.js";
import { generateEmbedding } from "../services/ai.service.js";
import { findSimilarJobs } from "../services/pinecone.service.js";
import fs from "fs";
import path from "path";

// ─── Candidate: apply to a job ────────────────────────────────────────
export const applyToJob = async (req, res) => {
  const { jobId } = req.body;

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (job.status !== "open")
    return res.status(400).json({ message: "This job is closed" });

  const existing = await Application.findOne({
    job: jobId,
    candidate: req.user._id,
  });
  if (existing)
    return res.status(400).json({ message: "You already applied to this job" });

  if (!req.file || !req.file.buffer)
    return res.status(400).json({ message: "Resume PDF is required" });

  console.log(
    `\n📄 File received: ${req.file.originalname} (${req.file.buffer.length} bytes)`,
  );

  // ── Step 1: Parse PDF text from buffer immediately ──────────────────
  console.log("📄 Parsing PDF from buffer...");
  const parsedText = await extractTextFromBuffer(req.file.buffer);
  console.log(`📄 Parsed text length: ${parsedText.length} chars`);

  if (parsedText.length < 20) {
    console.warn("⚠️  PDF text too short — file may be scanned/image-based");
  }

  // ── Step 2: Upload file to Cloudinary or save locally ───────────────
  let fileUrl = "";

  const useCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (useCloudinary) {
    try {
      const publicId = `resume_${Date.now()}_${req.user._id}`;
      const result = await uploadToCloudinary(req.file.buffer, publicId);
      fileUrl = result.secure_url;
      console.log(`☁️  Uploaded to Cloudinary: ${fileUrl}`);
    } catch (err) {
      console.error("❌ Cloudinary upload failed:", err.message);
      return res
        .status(500)
        .json({ message: "File upload failed. Please try again." });
    }
  } else {
    // Local storage fallback
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
    fileUrl = path.join(uploadDir, filename);
    fs.writeFileSync(fileUrl, req.file.buffer);
    console.log(`💾 Saved locally: ${fileUrl}`);
  }

  // ── Step 3: Save resume + application ──────────────────────────────
  const resume = await Resume.create({
    candidate: req.user._id,
    fileUrl,
    fileName: req.file.originalname,
    parsedText,
  });

  const application = await Application.create({
    job: jobId,
    candidate: req.user._id,
    resume: resume._id,
    status: "pending",
  });

  // ── Step 4: Add to screening queue with fallback ─────────────────────
  let queueSuccess = false;
  try {
    await screeningQueue.add(
      { applicationId: application._id.toString() },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    console.log(`✅ Application ${application._id} added to queue`);
    queueSuccess = true;
  } catch (queueErr) {
    console.error("❌ Queue add failed:", queueErr.message);
  }

  // If queue failed, process directly in background
  if (!queueSuccess) {
    console.log("⚠️  Queue unavailable — processing directly");
    processApplicationDirectly(application._id.toString()).catch((err) =>
      console.error("Direct processing failed:", err.message),
    );
  }

  res.status(201).json({ success: true, application });
};

// ─── Candidate: get their own applications ────────────────────────────
export const getMyApplications = async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate("job", "title company location status")
    .populate("resume", "fileName")
    .sort({ createdAt: -1 });

  res.json({ success: true, applications });
};

// ─── Recruiter: get all applicants for a job ──────────────────────────
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
    .sort({ aiScore: -1 });

  res.json({ success: true, applications });
};

// ─── Recruiter: update application status ────────────────────────────
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

// ─── Candidate: get recommended jobs via embeddings ───────────────────
export const getRecommendedJobs = async (req, res) => {
  const latestResume = await Resume.findOne({ candidate: req.user._id }).sort({
    createdAt: -1,
  });

  if (!latestResume?.parsedText) return res.json({ success: true, jobs: [] });

  try {
    const embedding = await generateEmbedding(latestResume.parsedText);
    const matches = await findSimilarJobs(embedding, 5);
    const jobIds = matches.map((m) => m.id.replace("job_", ""));
    const jobs = await Job.find({ _id: { $in: jobIds }, status: "open" });
    res.json({ success: true, jobs });
  } catch (err) {
    console.error("Recommended jobs error:", err.message);
    res.json({ success: true, jobs: [] });
  }
};

// ─── Recruiter: advanced search ───────────────────────────────────────
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

  const appMatch = { job: { $in: jobIds } };

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
    if (skillList.length > 0) appMatch.aiMissingSkills = { $nin: skillList };
  }

  const sortField = sortBy === "score" ? "aiScore" : "createdAt";
  const sortDir = sortOrder === "asc" ? 1 : -1;

  const pipeline = [
    { $match: appMatch },
    {
      $lookup: {
        from: "users",
        localField: "candidate",
        foreignField: "_id",
        as: "candidateData",
      },
    },
    { $unwind: "$candidateData" },
    {
      $lookup: {
        from: "jobs",
        localField: "job",
        foreignField: "_id",
        as: "jobData",
      },
    },
    { $unwind: "$jobData" },
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

  const postLookupMatch = {};
  if (search?.trim()) {
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
      resume: { fileName: "$resumeData.fileName" },
    },
  });

  pipeline.push({ $sort: { [sortField]: sortDir } });

  const countResult = await Application.aggregate([
    ...pipeline,
    { $count: "total" },
  ]);
  const total = countResult[0]?.total || 0;

  pipeline.push({ $skip: (Number(page) - 1) * Number(limit) });
  pipeline.push({ $limit: Number(limit) });

  const applications = await Application.aggregate(pipeline);

  const [facets] = await Application.aggregate([
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
  ]);

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

// ─── Recruiter: XAI breakdown ─────────────────────────────────────────
export const getXAIBreakdown = async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("candidate", "name email github")
    .populate("job", "title company skillsRequired")
    .populate("resume", "fileName");

  if (!application)
    return res.status(404).json({ message: "Application not found" });

  const job = await Job.findById(application.job);
  if (String(job.recruiter) !== String(req.user._id))
    return res.status(403).json({ message: "Access denied" });

  res.json({ success: true, application });
};
