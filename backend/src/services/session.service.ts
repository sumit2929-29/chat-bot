import { generateSessionToken, hashToken } from "../utils/crypto.js";
import { supabaseRequest } from "../utils/supabase.js";
import { QuotaService } from "./quota.service.js";
import { ApiError } from "../utils/apiError.js";

interface ClientRow {
  id: string;
}

interface ConversationRow {
  id: string;
}

export interface StartSessionResult {
  clientId: string;
  conversationId: string;
  sessionToken: string;
}

/**
 * Session Service
 * Handles client creation/lookup and conversation initialization.
 * Enforces single active session per student per day policy.
 */
export class SessionService {
  static async startSession(emailRaw: string, consentStatus: unknown): Promise<StartSessionResult> {
    const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";

    // 1. Validate Email & Consent
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "INVALID_EMAIL", "Please enter a valid email address.");
    }

    if (consentStatus !== true) {
      throw new ApiError(400, "CONSENT_REQUIRED", "You must accept the consent notice to start a conversation.");
    }

    // 2. Upsert Client in Supabase
    const clients = await supabaseRequest<ClientRow[]>("clients?on_conflict=email&select=id", {
      method: "POST",
      body: [{ email, consent_status: true }],
      prefer: "resolution=merge-duplicates,return=representation",
    });

    const client = clients[0];
    if (!client?.id) {
      throw new ApiError(503, "SESSION_START_FAILED", "Could not create client record.");
    }

    // 3. Generate Cryptographic 256-bit Session Token
    const sessionToken = generateSessionToken();
    const sessionTokenHash = hashToken(sessionToken);

    // 4. Enforce: Maximum one active session per student email per day
    const existingActiveId = await QuotaService.findActiveSessionToday(client.id);
    if (existingActiveId) {
      // Refresh session token hash on existing active conversation
      await supabaseRequest<undefined>(`conversations?id=eq.${existingActiveId}`, {
        method: "PATCH",
        body: {
          session_token_hash: sessionTokenHash,
          updated_at: new Date().toISOString(),
        },
        prefer: "return=minimal",
      });

      return {
        clientId: client.id,
        conversationId: existingActiveId,
        sessionToken,
      };
    }

    // 5. Create New Conversation in Supabase
    const conversations = await supabaseRequest<ConversationRow[]>("conversations?select=id", {
      method: "POST",
      body: [
        {
          client_id: client.id,
          status: "active",
          session_token_hash: sessionTokenHash,
        },
      ],
      prefer: "return=representation",
    });

    const conversation = conversations[0];
    if (!conversation?.id) {
      throw new ApiError(503, "SESSION_START_FAILED", "Could not initialize conversation session.");
    }

    return {
      clientId: client.id,
      conversationId: conversation.id,
      sessionToken,
    };
  }
}
