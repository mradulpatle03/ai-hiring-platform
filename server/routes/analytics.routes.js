import express from "express";
import {
  getOverviewStats,
  getApplicationsOverTime,
  getScoreDistribution,
  getHiringFunnel,
  getTopSkills,
  getScoreByJob,
  getRecentActivity,
} from "../controllers/analytics.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

const guard = [protect, restrictTo("recruiter")];

router.get("/overview", ...guard, getOverviewStats);
router.get("/over-time", ...guard, getApplicationsOverTime);
router.get("/score-dist", ...guard, getScoreDistribution);
router.get("/funnel", ...guard, getHiringFunnel);
router.get("/top-skills", ...guard, getTopSkills);
router.get("/score-by-job", ...guard, getScoreByJob);
router.get("/recent", ...guard, getRecentActivity);

export default router;