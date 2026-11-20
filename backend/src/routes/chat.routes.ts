import { Router } from "express";
import { ChatController } from "../controllers/chat.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimit.middleware.js";

export const chatRouter = Router();

// POST /api/chat/message (Session check + Rate limiting + Gemini Grounded AI)
chatRouter.post("/message", requireAuth, rateLimiter, ChatController.sendMessage);

// GET /api/chat/history (Session check + Paginated history)
chatRouter.get("/history", requireAuth, ChatController.getHistory);

