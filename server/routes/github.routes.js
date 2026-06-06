import express from "express";
import {
  initiateOAuth,
  handleCallback,
  getGitHubProfile,
  syncGitHub,
  disconnectGitHub,
} from "../controllers/github.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

const guard = [protect, restrictTo("candidate")];

router.get("/connect", ...guard, initiateOAuth);
router.get("/callback", handleCallback); // no auth — GitHub redirects here
router.get("/profile", ...guard, getGitHubProfile);
router.post("/sync", ...guard, syncGitHub);
router.delete("/disconnect", ...guard, disconnectGitHub);

export default router;
