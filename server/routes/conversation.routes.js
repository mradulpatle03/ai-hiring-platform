import express from "express";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
} from "../controllers/conversation.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getMyConversations);
router.get("/application/:applicationId", protect, getOrCreateConversation);
router.get("/:conversationId/messages", protect, getMessages);

export default router;