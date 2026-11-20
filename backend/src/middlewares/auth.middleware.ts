import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest, SessionContext } from "../types/index.js";
import { hashToken } from "../utils/crypto.js";
import { supabaseRequest } from "../utils/supabase.js";
import { ApiError } from "../utils/apiError.js";

export const SESSION_COOKIE_NAME = "chat_session";

/**
 * Authentication Middleware for Chat Endpoints
 * 1. Reads HttpOnly 'chat_session' cookie.
 * 2. Computes SHA-256 hash.
 * 3. Fetches active conversation session from Supabase.
 * 4. Ensures caller owns the session and attaches sessionContext to Request.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawToken = req.cookies?.[SESSION_COOKIE_NAME];
    if (!rawToken || typeof rawToken !== "string" || rawToken.length > 128) {
      throw new ApiError(401, "SESSION_REQUIRED", "Start a chat session before sending messages.");
    }

    const tokenHash = hashToken(rawToken);

    // Query Supabase conversations table for this session token hash
    const rows = await supabaseRequest<SessionContext[]>(
      `conversations?session_token_hash=eq.${tokenHash}&select=id,client_id,status&limit=1`
    );

    const session = rows[0];
    if (!session) {
      throw new ApiError(401, "SESSION_INVALID", "Your chat session is invalid or has expired.");
    }

    if (session.status !== "active") {
      throw new ApiError(409, "SESSION_CLOSED", "This chat session has been closed.");
    }

    // Attach to request
    req.sessionContext = session;
    req.sessionTokenHash = tokenHash;

    next();
  } catch (error) {
    next(error);
  }
}

