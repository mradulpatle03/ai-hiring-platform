import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["recruiter", "candidate"],
      required: true,
    },
    text: { type: String, required: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Message", messageSchema);
