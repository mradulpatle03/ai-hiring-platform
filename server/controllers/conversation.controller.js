import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Application from "../models/application.model.js";

// Called when recruiter shortlists — auto-creates conversation
export const getOrCreateConversation = async (req, res) => {
  const { applicationId } = req.params;

  const application = await Application.findById(applicationId).populate("job");

  if (!application)
    return res.status(404).json({ message: "Application not found" });

  // Only allowed if shortlisted
  if (application.status !== "shortlisted")
    return res
      .status(403)
      .json({ message: "Candidate must be shortlisted first" });

  // Check caller is the recruiter of this job OR the candidate
  const isRecruiter =
    String(application.job.recruiter) === String(req.user._id);
  const isCandidate = String(application.candidate) === String(req.user._id);
  if (!isRecruiter && !isCandidate)
    return res.status(403).json({ message: "Access denied" });

  let conversation = await Conversation.findOne({ application: applicationId })
    .populate("recruiter", "name email")
    .populate("candidate", "name email")
    .populate("job", "title company");

  if (!conversation) {
    conversation = await Conversation.create({
      job: application.job._id,
      application: applicationId,
      recruiter: application.job.recruiter,
      candidate: application.candidate,
    });
    conversation = await conversation.populate([
      { path: "recruiter", select: "name email" },
      { path: "candidate", select: "name email" },
      { path: "job", select: "title company" },
    ]);
  }

  res.json({ success: true, conversation });
};

// Get all conversations for logged-in user
export const getMyConversations = async (req, res) => {
  const field = req.user.role === "recruiter" ? "recruiter" : "candidate";

  const conversations = await Conversation.find({ [field]: req.user._id })
    .populate("recruiter", "name")
    .populate("candidate", "name")
    .populate("job", "title company")
    .sort({ lastMessageAt: -1 });

  res.json({ success: true, conversations });
};

// Get messages for a conversation (paginated)
export const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation)
    return res.status(404).json({ message: "Conversation not found" });

  // Verify user belongs to this conversation
  const belongs =
    String(conversation.recruiter) === String(req.user._id) ||
    String(conversation.candidate) === String(req.user._id);
  if (!belongs) return res.status(403).json({ message: "Access denied" });

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name role")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Mark messages as read
  const otherRole = req.user.role === "recruiter" ? "candidate" : "recruiter";
  await Message.updateMany(
    { conversation: conversationId, senderRole: otherRole, read: false },
    { read: true },
  );

  // Reset unread count
  const unreadField = `unread${req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)}`;
  await Conversation.findByIdAndUpdate(conversationId, { [unreadField]: 0 });

  res.json({ success: true, messages: messages.reverse() });
};