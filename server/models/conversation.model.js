import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    unreadRecruiter: { type: Number, default: 0 },
    unreadCandidate: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// One conversation per application
conversationSchema.index({ application: 1 }, { unique: true });

export default mongoose.model("Conversation", conversationSchema);
