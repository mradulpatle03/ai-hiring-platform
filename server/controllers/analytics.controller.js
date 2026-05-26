import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import mongoose from "mongoose";

// Helper: get recruiter's job IDs
const getRecruiterJobIds = async (recruiterId) => {
  const jobs = await Job.find({ recruiter: recruiterId }).select("_id");
  return jobs.map((j) => j._id);
};

// 1. Overview stats
export const getOverviewStats = async (req, res) => {
  const jobIds = await getRecruiterJobIds(req.user._id);

  const [
    totalJobs,
    openJobs,
    totalApplications,
    shortlisted,
    avgScoreResult,
    screened,
  ] = await Promise.all([
    Job.countDocuments({ recruiter: req.user._id }),
    Job.countDocuments({ recruiter: req.user._id, status: "open" }),
    Application.countDocuments({ job: { $in: jobIds } }),
    Application.countDocuments({ job: { $in: jobIds }, status: "shortlisted" }),
    Application.aggregate([
      {
        $match: { job: { $in: jobIds }, aiScore: { $exists: true, $ne: null } },
      },
      { $group: { _id: null, avg: { $avg: "$aiScore" } } },
    ]),
    Application.countDocuments({ job: { $in: jobIds }, status: "screened" }),
  ]);

  const avgScore = avgScoreResult[0]?.avg
    ? Math.round(avgScoreResult[0].avg)
    : null;

  const conversionRate =
    totalApplications > 0
      ? Math.round((shortlisted / totalApplications) * 100)
      : 0;

  res.json({
    success: true,
    stats: {
      totalJobs,
      openJobs,
      totalApplications,
      shortlisted,
      screened,
      avgScore,
      conversionRate,
    },
  });
};

// 2. Applications over time (last 30 days)
export const getApplicationsOverTime = async (req, res) => {
  const jobIds = await getRecruiterJobIds(req.user._id);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const results = await Application.aggregate([
    {
      $match: {
        job: { $in: jobIds },
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in missing days with 0
  const map = {};
  results.forEach((r) => {
    map[r._id] = r.count;
  });

  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    days.push({ date: key, label, count: map[key] || 0 });
  }

  res.json({ success: true, data: days });
};

// 3. Score distribution (histogram)
export const getScoreDistribution = async (req, res) => {
  const jobIds = await getRecruiterJobIds(req.user._id);

  const results = await Application.aggregate([
    {
      $match: {
        job: { $in: jobIds },
        aiScore: { $exists: true, $ne: null },
      },
    },
    {
      $bucket: {
        groupBy: "$aiScore",
        boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 101],
        default: "other",
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const labels = [
    "0–9",
    "10–19",
    "20–29",
    "30–39",
    "40–49",
    "50–59",
    "60–69",
    "70–79",
    "80–89",
    "90–100",
  ];
  const data = labels.map((label, i) => ({
    range: label,
    count: results.find((r) => r._id === i * 10)?.count || 0,
  }));

  res.json({ success: true, data });
};

// 4. Hiring funnel
export const getHiringFunnel = async (req, res) => {
  const jobIds = await getRecruiterJobIds(req.user._id);

  const results = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const statusMap = {};
  results.forEach((r) => {
    statusMap[r._id] = r.count;
  });

  const total = Object.values(statusMap).reduce((a, b) => a + b, 0);

  const funnel = [
    { stage: "Applied", count: total, color: "#7F77DD" },
    {
      stage: "Screened",
      count:
        (statusMap.screened || 0) +
        (statusMap.shortlisted || 0) +
        (statusMap.rejected || 0),
      color: "#378ADD",
    },
    {
      stage: "Shortlisted",
      count: statusMap.shortlisted || 0,
      color: "#1D9E75",
    },
  ];

  res.json({ success: true, funnel });
};

// 5. Top skills in applicant pool 
export const getTopSkills = async (req, res) => {
  const jobIds = await getRecruiterJobIds(req.user._id);

  // Extract all matched skills from AI screening results
  const results = await Application.aggregate([
    {
      $match: {
        job: { $in: jobIds },
        aiScore: { $exists: true },
      },
    },
    {
      $unwind: { path: "$aiMissingSkills", preserveNullAndEmptyArrays: false },
    },
    {
      $group: {
        _id: { $toLower: "$aiMissingSkills" },
        count: { $sum: 1 },
        avgScore: { $avg: "$aiScore" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const data = results.map((r) => ({
    skill: r._id,
    count: r.count,
    avgScore: Math.round(r.avgScore),
  }));

  res.json({ success: true, data });
};

// 6. Score by job (which jobs attract best candidates) 
export const getScoreByJob = async (req, res) => {
  const jobIds = await getRecruiterJobIds(req.user._id);

  const results = await Application.aggregate([
    {
      $match: {
        job: { $in: jobIds },
        aiScore: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$job",
        avgScore: { $avg: "$aiScore" },
        count: { $sum: 1 },
        maxScore: { $max: "$aiScore" },
      },
    },
    {
      $lookup: {
        from: "jobs",
        localField: "_id",
        foreignField: "_id",
        as: "job",
      },
    },
    { $unwind: "$job" },
    { $sort: { avgScore: -1 } },
    { $limit: 8 },
  ]);

  const data = results.map((r) => ({
    jobTitle: r.job.title,
    avgScore: Math.round(r.avgScore),
    maxScore: Math.round(r.maxScore),
    count: r.count,
  }));

  res.json({ success: true, data });
};

// 7. Recent activity feed
export const getRecentActivity = async (req, res) => {
  const jobIds = await getRecruiterJobIds(req.user._id);

  const recent = await Application.find({ job: { $in: jobIds } })
    .populate("candidate", "name")
    .populate("job", "title")
    .sort({ updatedAt: -1 })
    .limit(8);

  const activity = recent.map((a) => ({
    candidateName: a.candidate?.name,
    jobTitle: a.job?.title,
    status: a.status,
    aiScore: a.aiScore,
    updatedAt: a.updatedAt,
  }));

  res.json({ success: true, activity });
};