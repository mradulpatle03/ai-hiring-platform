import Interview from "../models/interview.model.js";
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import {
  sendSlotProposalEmail,
  sendConfirmationEmails,
  sendCancellationEmail,
} from "../services/email.service.js";

// Recruiter: propose slots
export const proposeSlots = async (req, res) => {
  const { applicationId, slots, meetLink, notes } = req.body;

  if (!slots?.length || slots.length < 1 || slots.length > 5)
    return res.status(400).json({ message: "Provide 1–5 time slots" });

  const application = await Application.findById(applicationId).populate("job");

  if (!application)
    return res.status(404).json({ message: "Application not found" });

  if (application.status !== "shortlisted")
    return res
      .status(400)
      .json({ message: "Candidate must be shortlisted first" });

  if (String(application.job.recruiter) !== String(req.user._id))
    return res.status(403).json({ message: "Not your job" });

  // Check no existing interview
  const existing = await Interview.findOne({ application: applicationId });
  if (existing && existing.status !== "cancelled")
    return res
      .status(400)
      .json({ message: "Interview already scheduled for this application" });

  // Validate slots are in the future
  const now = new Date();
  const validSlots = slots.filter((s) => new Date(s) > now);
  if (validSlots.length === 0)
    return res.status(400).json({ message: "All slots must be in the future" });

  const interview = await Interview.create({
    application: applicationId,
    job: application.job._id,
    recruiter: req.user._id,
    candidate: application.candidate,
    slots: validSlots.map((s) => ({ dateTime: new Date(s) })),
    meetLink: meetLink || "",
    notes: notes || "",
    status: "pending_selection",
  });

  // Send email to candidate
  const candidate = await User.findById(application.candidate);
  const job = application.job;

  await sendSlotProposalEmail({
    candidate,
    recruiter: req.user,
    job,
    slots: validSlots,
    meetLink,
    notes,
    interviewId: interview._id.toString(),
  });

  res.status(201).json({ success: true, interview });
};

// Candidate: confirm a slot
export const confirmSlot = async (req, res) => {
  const { interviewId } = req.params;
  const { slotId } = req.body;

  const interview = await Interview.findById(interviewId)
    .populate("job")
    .populate("recruiter", "name email")
    .populate("candidate", "name email");

  if (!interview)
    return res.status(404).json({ message: "Interview not found" });

  if (String(interview.candidate._id) !== String(req.user._id))
    return res.status(403).json({ message: "Access denied" });

  if (interview.status !== "pending_selection")
    return res
      .status(400)
      .json({ message: "Interview is no longer pending selection" });

  const slot = interview.slots.id(slotId);
  if (!slot || !slot.available)
    return res.status(400).json({ message: "Slot not found or unavailable" });

  // Confirm
  interview.confirmedSlot = slot.dateTime;
  interview.status = "scheduled";
  interview.slots.forEach((s) => {
    s.available = String(s._id) === String(slotId);
  });
  await interview.save();

  // Send confirmation emails with .ics to both
  await sendConfirmationEmails({
    candidate: interview.candidate,
    recruiter: interview.recruiter,
    job: interview.job,
    confirmedSlot: slot.dateTime,
    meetLink: interview.meetLink,
    interviewId: interview._id.toString(),
  });

  res.json({ success: true, interview });
};

// Cancel interview
export const cancelInterview = async (req, res) => {
  const interview = await Interview.findById(req.params.interviewId)
    .populate("job")
    .populate("recruiter", "name email")
    .populate("candidate", "name email");

  if (!interview)
    return res.status(404).json({ message: "Interview not found" });

  const isRecruiter = String(interview.recruiter._id) === String(req.user._id);
  const isCandidate = String(interview.candidate._id) === String(req.user._id);
  if (!isRecruiter && !isCandidate)
    return res.status(403).json({ message: "Access denied" });

  interview.status = "cancelled";
  await interview.save();

  await sendCancellationEmail({
    candidate: interview.candidate,
    recruiter: interview.recruiter,
    job: interview.job,
    cancelledBy: req.user.name,
  });

  res.json({ success: true, interview });
};

// Get interview for an application
export const getInterviewByApplication = async (req, res) => {
  const { applicationId } = req.params;

  const interview = await Interview.findOne({ application: applicationId })
    .populate("recruiter", "name email")
    .populate("candidate", "name email")
    .populate("job", "title company");

  if (!interview)
    return res.status(404).json({ message: "No interview scheduled" });

  // Verify access
  const isRecruiter = String(interview.recruiter._id) === String(req.user._id);
  const isCandidate = String(interview.candidate._id) === String(req.user._id);
  if (!isRecruiter && !isCandidate)
    return res.status(403).json({ message: "Access denied" });

  res.json({ success: true, interview });
};

// Get all interviews for logged-in user
export const getMyInterviews = async (req, res) => {
  const field = req.user.role === "recruiter" ? "recruiter" : "candidate";

  const interviews = await Interview.find({ [field]: req.user._id })
    .populate("recruiter", "name email")
    .populate("candidate", "name email")
    .populate("job", "title company")
    .sort({ createdAt: -1 });

  res.json({ success: true, interviews });
};

// Recruiter: mark interview as completed
export const completeInterview = async (req, res) => {
  const interview = await Interview.findById(req.params.interviewId);

  if (!interview)
    return res.status(404).json({ message: "Interview not found" });

  if (String(interview.recruiter) !== String(req.user._id))
    return res.status(403).json({ message: "Access denied" });

  interview.status = "completed";
  await interview.save();

  res.json({ success: true, interview });
};
