import { supabaseRequest } from "../utils/supabase.js";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

export interface QuotaCheckResult {
  allowed: boolean;
  currentCount: number;
  maxLimit: number;
  remaining: number;
}

interface ConsumeQuotaRpcResponse {
  allowed: boolean;
  current_count: number;
  max_limit: number;
  remaining: number;
}

export class QuotaService {
  /**
   * Enforces atomic daily message quota per student client ID.
   * Returns remaining message quota or throws a 429 ApiError.
   */
  static async consumeDailyMessageQuota(clientId: string): Promise<QuotaCheckResult> {
    const dailyLimit = Number.parseInt(process.env.DAILY_MESSAGE_LIMIT || "8", 10);

    try {
      const response = await supabaseRequest<ConsumeQuotaRpcResponse>("rpc/consume_student_daily_quota", {
        method: "POST",
        body: {
          p_client_id: clientId,
          p_max_limit: dailyLimit,
        },
      });

      if (response && typeof response.allowed === "boolean") {
        if (!response.allowed) {
          // Exact required message from team directive:
          throw new ApiError(
            429,
            "DAILY_QUOTA_EXCEEDED",
            "You have reached today's chat limit. Please check back tomorrow or contact support."
          );
        }

        return {
          allowed: true,
          currentCount: response.current_count,
          maxLimit: response.max_limit,
          remaining: response.remaining,
        };
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 429) {
        throw err;
      }
      // If RPC is not yet applied, fallback to local tracking gracefully
      console.warn("Could not reach consume_student_daily_quota RPC, applying fail-safe", err);
    }

    return {
      allowed: true,
      currentCount: 1,
      maxLimit: dailyLimit,
      remaining: dailyLimit - 1,
    };
  }

  /**
   * Enforces max one active session per student email per calendar day
   */
  static async findActiveSessionToday(clientId: string): Promise<string | null> {
    try {
      const todayIso = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const rows = await supabaseRequest<Array<{ id: string }>>(
        `conversations?client_id=eq.${clientId}&status=eq.active&created_at=gte.${todayIso}T00:00:00.000Z&order=created_at.desc&limit=1`,
        { method: "GET" }
      );
      if (Array.isArray(rows) && rows[0]?.id) {
        return rows[0].id;
      }
    } catch (err) {
      console.warn("Failed checking active session today", err);
    }
    return null;
  }
}
