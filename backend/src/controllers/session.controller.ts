import type { Request, Response, NextFunction } from "express";
import { SessionService } from "../services/session.service.js";
import { SESSION_COOKIE_NAME } from "../middlewares/auth.middleware.js";
import { env } from "../config/env.js";

const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

/**
 * Session Controller
 * Endpoints for starting new support conversations.
 */
export class SessionController {
  static async startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, consent_status } = req.body || {};

      const result = await SessionService.startSession(email, consent_status);

      // Set HttpOnly, Secure, SameSite session cookie
      const isProduction = process.env.NODE_ENV === "production";
      const sameSite = env.security.sessionCookieSameSite;

      res.cookie(SESSION_COOKIE_NAME, result.sessionToken, {
        httpOnly: true,
        secure: isProduction || sameSite === "none",
        sameSite,
        maxAge: COOKIE_MAX_AGE_MS,
        path: "/",
      });

      res.status(201).json({
        client_id: result.clientId,
        conversation_id: result.conversationId,
      });
    } catch (error) {
      next(error);
    }
  }
}

