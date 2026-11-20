import type { Request, Response } from "express";
import { ClerkAuthRequest } from "../middlewares/clerkAuth.middleware.js";
import { supabaseRequest } from "../utils/supabase.js";
import { env } from "../config/env.js";

/**
 * GET /api/auth/me
 * Returns verified authenticated dashboard user and tenant details
 */
export async function getMeHandler(req: ClerkAuthRequest, res: Response): Promise<void> {
  res.status(200).json({
    authenticated: true,
    user: req.clerkUser,
  });
}

/**
 * POST /api/auth/webhook
 * Handles Clerk Svix Webhooks for User Synchronization
 */
export async function clerkWebhookHandler(req: Request, res: Response): Promise<void> {
  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  // Basic signature header presence check
  if (env.clerk.webhookSecret && (!svixId || !svixTimestamp || !svixSignature)) {
    res.status(400).json({ error: "Missing required svix webhook headers." });
    return;
  }

  const { type, data } = req.body || {};

  try {
    if (type === "user.created" || type === "user.updated") {
      const clerkUserId = data.id;
      const email = data.email_addresses?.[0]?.email_address || `user-${clerkUserId}@institution.edu`;
      const firstName = data.first_name || "";
      const lastName = data.last_name || "";
      const avatarUrl = data.image_url || null;

      await supabaseRequest<unknown>("users", {
        method: "POST",
        body: [
          {
            clerk_user_id: clerkUserId,
            email,
            first_name: firstName,
            last_name: lastName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          },
        ],
        prefer: "resolution=merge-duplicates,return=minimal",
      });
    } else if (type === "user.deleted") {
      const clerkUserId = data.id;
      await supabaseRequest<undefined>(`users?clerk_user_id=eq.${clerkUserId}`, {
        method: "DELETE",
        prefer: "return=minimal",
      });
    }

    res.status(200).json({ success: true, received: true });
  } catch (err) {
    console.error("Clerk webhook sync error:", err);
    res.status(500).json({ error: "Webhook processing error." });
  }
}
