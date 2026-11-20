import { Router } from "express";
import { getMeHandler, clerkWebhookHandler } from "../controllers/auth.controller.js";
import { requireClerkAuth } from "../middlewares/clerkAuth.middleware.js";

export const authRouter = Router();

// Protected dashboard user info
authRouter.get("/me", requireClerkAuth, getMeHandler);

// Clerk Svix Webhook endpoint
authRouter.post("/webhook", clerkWebhookHandler);
