import Job from "../models/job.model.js";
import {
  parseJobDescription,
  generateEmbedding,
} from "../services/ai.service.js";
import { upsertJobEmbedding } from "../services/pinecone.service.js";

// Recruiter: create a job
export const createJob = async (req, res) => {
  const { title, description, location, salary, experienceYears } = req.body;

  const job = await Job.create({
    title,
    description,
    location,
    salary,
    experienceYears,
    company: req.user.company || req.user.name,
    recruiter: req.user._id,
  });

  // 2. Parse JD with AI to extract skills (non-blocking — don't await in response)
  parseJobDescription(description)
  .then(async (parsed) => {
    try {
      job.skillsRequired = parsed.skillsRequired || [];
      job.experienceYears = parsed.experienceYears || experienceYears;
      await job.save();

      const embedding = await generateEmbedding(`${title} ${description}`);

      if (!embedding) {
        console.error("Skipping embedding: invalid");
        return;
      }

      await upsertJobEmbedding(job._id.toString(), embedding, {
        title,
        recruiterId: req.user._id.toString(),
      });

      console.log(`Job ${job._id} parsed and embedded`);
    } catch (err) {
      console.error("Background processing failed:", err.message);
    }
  })
  .catch((err) => console.error("JD parsing failed:", err.message));
  // Respond immediately — AI happens in background
  res.status(201).json({ success: true, job });
};

// Public: get all open jobs (candidates browse this)
export const getAllJobs = async (req, res) => {
  const { search, location } = req.query;
  const filter = { status: "open" };

  if (search) filter.title = { $regex: search, $options: "i" };
  if (location) filter.location = { $regex: location, $options: "i" };

  const jobs = await Job.find(filter)
    .populate("recruiter", "name company")
    .sort({ createdAt: -1 });

  res.json({ success: true, jobs });
};

// Public: get single job
export const getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    "recruiter",
    "name company",
  );
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json({ success: true, job });
};

// Recruiter: get their own jobs
export const getMyJobs = async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, jobs });
};

// Recruiter: update job
export const updateJob = async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    recruiter: req.user._id,
  });
  if (!job) return res.status(404).json({ message: "Job not found" });

  Object.assign(job, req.body);
  await job.save();
  res.json({ success: true, job });
};

// Recruiter: close job
export const closeJob = async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiter: req.user._id },
    { status: "closed" },
    { new: true },
  );
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json({ success: true, job });
};
