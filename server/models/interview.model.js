import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    dateTime: { type: Date, required: true },
    available: { type: Boolean, default: true },
  },
  { _id: true },
);

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
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

    slots: [slotSchema], // recruiter proposes these
    confirmedSlot: { type: Date }, // candidate picks this one
    meetLink: { type: String }, // Google Meet / Zoom link
    notes: { type: String }, // recruiter notes to candidate

    status: {
      type: String,
      enum: ["pending_selection", "scheduled", "cancelled", "completed"],
      default: "pending_selection",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Interview", interviewSchema);
