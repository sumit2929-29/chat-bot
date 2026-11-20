import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest, RateLimitResult } from "../types/index.js";
import { env } from "../config/env.js";
import { hashToken } from "../utils/crypto.js";
import { supabaseRequest } from "../utils/supabase.js";
import { ApiError } from "../utils/apiError.js";

function getClientIp(req: AuthenticatedRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) {
    return realIp.trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

async function consumeBucket(bucketKey: string): Promise<RateLimitResult> {
  const { rateLimitMaxRequests, rateLimitWindowSeconds } = env.security;

  const result = await supabaseRequest<RateLimitResult[]>("rpc/consume_chat_rate_limit", {
    method: "POST",
    body: {
      p_bucket_key: bucketKey,
      p_max_requests: rateLimitMaxRequests,
      p_window_seconds: rateLimitWindowSeconds,
    },
  });

  if (!Array.isArray(result) || !result[0]) {
    throw new ApiError(503, "RATE_LIMIT_UNAVAILABLE", "Rate limiting service is temporarily unavailable.");
  }

  return result[0];
}

/**
 * Atomic Database Rate Limiter Middleware
 * Uses PostgreSQL RPC function to track requests atomically across distributed instances.
 */
export async function rateLimiter(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionHash = req.sessionTokenHash || "anonymous";
    const clientIp = getClientIp(req);
    const ipHash = hashToken(clientIp);

    // Concurrently consume both session and IP buckets
    const [sessionLimit, ipLimit] = await Promise.all([
      consumeBucket(`session:${sessionHash}`),
      consumeBucket(`ip:${ipHash}`),
    ]);

    const blocked = [sessionLimit, ipLimit].filter((b) => !b.allowed);
    if (blocked.length === 0) {
      return next();
    }

    const resetTimes = blocked.map((b) => Date.parse(b.reset_at));
    const retryAt = Math.max(...resetTimes);
    const retryAfter = Math.max(1, Math.ceil((retryAt - Date.now()) / 1000));

    throw new ApiError(
      429,
      "RATE_LIMITED",
      "Too many messages sent. Please wait a moment before trying again.",
      retryAfter
    );
  } catch (error) {
    next(error);
  }
}

