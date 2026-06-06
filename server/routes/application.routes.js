import express from "express";
import {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  getRecommendedJobs,
  searchApplicants,
  getXAIBreakdown,
} from "../controllers/application.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import { upload } from "../config/multer.js";
import {
  applyToJobSchema,
  updateApplicationStatusSchema,
  searchQuerySchema,
} from "../validation/schemas.js";
import { applyLimiter, uploadLimiter } from '../middleware/rateLimit.middleware.js'

const router = express.Router();

router.get("/mine", protect, restrictTo("candidate"), getMyApplications);
router.get(
  "/recommended",
  protect,
  restrictTo("candidate"),
  getRecommendedJobs,
);
router.get(
  "/search",
  protect,
  restrictTo("recruiter"),
  validateQuery(searchQuerySchema),
  searchApplicants,
);
router.get("/job/:jobId", protect, restrictTo("recruiter"), getJobApplicants);
router.get("/:id/xai", protect, restrictTo("recruiter"), getXAIBreakdown);

router.post(
  "/",
  protect,
  restrictTo("candidate"),
  applyLimiter,
  uploadLimiter,
  upload.single("resume"),
  validate(applyToJobSchema),
  applyToJob,
);

router.patch(
  "/:id/status",
  protect,
  restrictTo("recruiter"),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus,
);

export default router;
