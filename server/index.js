import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import "express-async-errors";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { initPinecone } from "./services/pinecone.service.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import githubRoutes from "./routes/github.routes.js";

import User from "./models/user.model.js";
import Message from "./models/message.model.js";
import Conversation from "./models/conversation.model.js";

import { validateEnv } from "./config/validateEnv.js";
validateEnv();

import {
  helmetConfig,
  sanitizeConfig,
  hppConfig,
} from "./middleware/security.middleware.js";
import {
  globalLimiter,
  authLimiter,
  registerLimiter,
  applyLimiter,
  uploadLimiter,
} from "./middleware/rateLimit.middleware.js";

globalThis.fetch = fetch;

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

app.use(helmetConfig);
app.set("trust proxy", 1);

app.use("/api", globalLimiter);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10kb" })); // prevent huge JSON payloads
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(sanitizeConfig);
app.use(hppConfig);

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/github", githubRoutes);

// Error handler (always last)
app.use(errorHandler);

// Socket.io auth middleware
// Reads JWT from handshake auth token
io.use(async (socket, next) => {
  try {
    // Read token from HTTP-only cookie instead of localStorage
    const cookieHeader = socket.handshake.headers.cookie || "";
    const token = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return next(new Error("Authentication required"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.user.name} (${socket.user.role})`);

  // User joins their personal room (for targeted notifications)
  socket.join(`user_${socket.user._id}`);

  // Join a conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conv_${conversationId}`);
    console.log(`${socket.user.name} joined conv_${conversationId}`);
  });

  // Leave a conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conv_${conversationId}`);
  });

  // Send a message
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, text } = data;
      if (!text?.trim()) return;

      // Verify user belongs to this conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return socket.emit("error", "Conversation not found");

      const isRecruiter =
        String(conversation.recruiter) === String(socket.user._id);
      const isCandidate =
        String(conversation.candidate) === String(socket.user._id);
      if (!isRecruiter && !isCandidate)
        return socket.emit("error", "Access denied");

      // Save message to DB
      const message = await Message.create({
        conversation: conversationId,
        sender: socket.user._id,
        senderRole: socket.user.role,
        text: text.trim(),
      });

      await message.populate("sender", "name role");

      // Update conversation last message + unread count
      const unreadField = isRecruiter ? "unreadCandidate" : "unreadRecruiter";
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text.trim().slice(0, 80),
        lastMessageAt: new Date(),
        $inc: { [unreadField]: 1 },
      });

      // Broadcast to everyone in the conversation room
      io.to(`conv_${conversationId}`).emit("new_message", message);

      // Send notification to the other user's personal room
      const otherUserId = isRecruiter
        ? conversation.candidate
        : conversation.recruiter;

      io.to(`user_${otherUserId}`).emit("conversation_updated", {
        conversationId,
        lastMessage: text.trim().slice(0, 80),
        senderName: socket.user.name,
      });
    } catch (err) {
      console.error("send_message error:", err);
      socket.emit("error", "Failed to send message");
    }
  });

  // Typing indicator
  socket.on("typing_start", ({ conversationId }) => {
    socket.to(`conv_${conversationId}`).emit("typing", {
      userId: socket.user._id,
      name: socket.user.name,
    });
  });

  socket.on("typing_stop", ({ conversationId }) => {
    socket.to(`conv_${conversationId}`).emit("stopped_typing", {
      userId: socket.user._id,
    });
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.user.name}`);
  });
});

connectDB().then(async () => {
  await initPinecone();
  server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
});
