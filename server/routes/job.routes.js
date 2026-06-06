import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  closeJob,
} from "../controllers/job.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createJobSchema, updateJobSchema } from "../validation/schemas.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/recruiter/mine", protect, restrictTo("recruiter"), getMyJobs);
router.get("/:id", getJobById);
router.post(
  "/",
  protect,
  restrictTo("recruiter"),
  validate(createJobSchema),
  createJob,
);
router.patch(
  "/:id",
  protect,
  restrictTo("recruiter"),
  validate(updateJobSchema),
  updateJob,
);
router.patch("/:id/close", protect, restrictTo("recruiter"), closeJob);

export default router;
