import { createHash, randomBytes } from "node:crypto";

/**
 * Computes a SHA-256 hex digest of a string token.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a high-entropy 32-byte cryptographically secure random session token.
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

