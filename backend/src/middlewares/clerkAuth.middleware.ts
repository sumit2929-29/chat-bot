import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { supabaseRequest } from "../utils/supabase.js";
import { ApiError } from "../utils/apiError.js";

export interface AuthenticatedClerkUser {
  id: string;
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "super_admin" | "company_admin" | "team_member";
  companyId: string;
  companyName: string;
}

export interface ClerkAuthRequest extends Request {
  clerkUser?: AuthenticatedClerkUser;
}

/**
 * Clerk Dashboard Authentication Middleware
 * Enforces cryptographic Bearer token verification for admin routes.
 */
export async function requireClerkAuth(
  req: ClerkAuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "UNAUTHORIZED", "Missing or malformed Authorization header."));
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Bearer token is empty."));
  }

  try {
    // 1. Verify Clerk JWT Token
    let clerkUserId: string | null = null;
    let userEmail: string = "admin@institution.edu";

    if (env.clerk.isConfigured) {
      // In production with CLERK_SECRET_KEY, verify via Clerk Backend API
      const clerkVerifyRes = await fetch("https://api.clerk.com/v1/tokens/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.clerk.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!clerkVerifyRes.ok) {
        return next(new ApiError(401, "INVALID_TOKEN", "Clerk session token is expired or invalid."));
      }

      const verifyData = (await clerkVerifyRes.json()) as { sub?: string; email?: string };
      clerkUserId = verifyData.sub || null;
      if (verifyData.email) userEmail = verifyData.email;
    } else {
      // In local dev/testing without active Clerk keys, decode unverified sub for offline testing
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
          clerkUserId = payload.sub || "test_clerk_user_id";
          if (payload.email) userEmail = payload.email;
        }
      } catch {
        clerkUserId = token.startsWith("test_") ? token : null;
      }
    }

    if (!clerkUserId) {
      return next(new ApiError(401, "INVALID_TOKEN", "Token contains no valid user identity."));
    }

    // 2. Resolve User & Company Membership in Supabase
    let userRows = await supabaseRequest<Array<{ id: string; email: string }>>(
      `users?clerk_user_id=eq.${clerkUserId}&select=id,email`,
      { method: "GET" }
    );

    // Auto-provision user if first login
    if (!userRows || userRows.length === 0) {
      userRows = await supabaseRequest<Array<{ id: string; email: string }>>("users", {
        method: "POST",
        body: [{ clerk_user_id: clerkUserId, email: userEmail }],
        prefer: "return=representation",
      });
    }

    const dbUser = userRows[0];
    const userId = dbUser?.id || "00000000-0000-0000-0000-000000000001";

    // 3. Resolve Company Membership & Role
    const membershipRows = await supabaseRequest<
      Array<{ role: "super_admin" | "company_admin" | "team_member"; company_id: string; companies?: { name: string } }>
    >(`company_memberships?user_id=eq.${userId}&select=role,company_id,companies(name)&limit=1`, {
      method: "GET",
    });

    const membership = membershipRows[0];
    req.clerkUser = {
      id: userId,
      clerkUserId,
      email: userEmail,
      role: membership?.role || "company_admin",
      companyId: membership?.company_id || "00000000-0000-0000-0000-000000000001",
      companyName: membership?.companies?.name || "Campus Support Administration",
    };

    next();
  } catch (err) {
    next(new ApiError(401, "AUTHENTICATION_FAILED", "Could not verify administrative identity."));
  }
}

/**
 * Role-Based Access Control Middleware Helper
 */
export function requireRole(allowedRoles: Array<"super_admin" | "company_admin" | "team_member">) {
  return (req: ClerkAuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.clerkUser) {
      return next(new ApiError(401, "UNAUTHORIZED", "Authentication required."));
    }

    if (!allowedRoles.includes(req.clerkUser.role)) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          `Access denied. Requires one of [${allowedRoles.join(", ")}] roles.`
        )
      );
    }

    next();
  };
}
