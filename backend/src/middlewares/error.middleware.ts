import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

/**
 * Global Centralized Error Handling Middleware
 * Ensures all errors are sanitized and formatted consistently.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    if (err.retryAfterSeconds !== undefined) {
      res.setHeader("Retry-After", String(err.retryAfterSeconds));
    }
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Sanitize unknown errors to prevent stack trace or secret leakage
  console.error("[ServerError]", err instanceof Error ? err.message : "Unknown error");
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected server error occurred. Please try again later.",
    },
  });
}

