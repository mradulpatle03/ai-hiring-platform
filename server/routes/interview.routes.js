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
import { validate } from "../middleware/validate.middleware.js";
import {
  proposeSlotsSchema,
  confirmSlotSchema,
} from "../validation/schemas.js";

const router = express.Router();

router.get("/", protect, getMyInterviews);
router.get("/application/:applicationId", protect, getInterviewByApplication);
router.post(
  "/",
  protect,
  restrictTo("recruiter"),
  validate(proposeSlotsSchema),
  proposeSlots,
);
router.post(
  "/:interviewId/confirm",
  protect,
  restrictTo("candidate"),
  validate(confirmSlotSchema),
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
