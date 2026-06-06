import express from "express";
import {
  proposeSlots,
  confirmSlot,
  cancelInterview,
  getInterviewByApplication,
  getMyInterviews,
  completeInterview,
} from "../controllers/interview.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getMyInterviews);
router.post("/", protect, restrictTo("recruiter"), proposeSlots);
router.get("/application/:applicationId", protect, getInterviewByApplication);
router.post(
  "/:interviewId/confirm",
  protect,
  restrictTo("candidate"),
  confirmSlot,
);
router.patch("/:interviewId/cancel", protect, cancelInterview);
router.patch(
  "/:interviewId/complete",
  protect,
  restrictTo("recruiter"),
  completeInterview,
);

export default router;
