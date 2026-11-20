import { supabaseRequest } from "../utils/supabase.js";
import { GeminiService } from "./gemini.service.js";
import { KnowledgeService } from "./knowledge.service.js";
import { QuotaService } from "./quota.service.js";
import { FaqService } from "./faq.service.js";
import { validateAndGuardMessage } from "../utils/guardrails.js";
import { ApiError } from "../utils/apiError.js";
import type { SessionContext } from "../types/index.js";

interface MessageRow {
  id: string;
  created_at: string;
}

export interface ChatMessageResult {
  reply: string;
  messageId: string;
  timestamp: string;
  provider?: string;
  cached?: boolean;
}

export interface HistoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface HistoryResult {
  conversationId: string;
  messages: HistoryMessage[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Chat Service
 * Coordinates input validation, student daily quota, FAQ caching,
 * Supabase knowledge retrieval, and direct Google Gemini API answers.
 */
export class ChatService {
  /**
   * Process and respond to user messages with complete guardrails
   */
  static async sendMessage(session: SessionContext, messageRaw: unknown): Promise<ChatMessageResult> {
    // 1. Strict 400-char validation, XSS sanitization & prompt injection guard
    const guardResult = validateAndGuardMessage(messageRaw);
    const sanitizedMessage = guardResult.sanitizedMessage;

    // Handle direct guardrail rejections (e.g., prompt injection or academic assignments)
    if (!guardResult.isValid && guardResult.directAnswer) {
      await supabaseRequest<unknown>("messages", {
        method: "POST",
        body: [{ conversation_id: session.id, role: "user", content: sanitizedMessage }],
        prefer: "return=minimal",
      });

      const assistantRows = await supabaseRequest<MessageRow[]>("messages?select=id,created_at", {
        method: "POST",
        body: [{ conversation_id: session.id, role: "assistant", content: guardResult.directAnswer }],
        prefer: "return=representation",
      });

      const assistantMsg = assistantRows[0];
      return {
        reply: guardResult.directAnswer,
        messageId: assistantMsg?.id || `guard-${Date.now()}`,
        timestamp: assistantMsg?.created_at || new Date().toISOString(),
        provider: "guardrail_policy",
        cached: false,
      };
    }

    // 2. Enforce Daily Usage Quota
    await QuotaService.consumeDailyMessageQuota(session.client_id);

    // 3. Check Verified FAQ Cache before invoking LLM (sub-20ms instant answers)
    const faqResult = await FaqService.checkFaqCache(sanitizedMessage);
    if (faqResult.hit && faqResult.answer) {
      await supabaseRequest<unknown>("messages", {
        method: "POST",
        body: [{ conversation_id: session.id, role: "user", content: sanitizedMessage }],
        prefer: "return=minimal",
      });

      const assistantRows = await supabaseRequest<MessageRow[]>("messages?select=id,created_at", {
        method: "POST",
        body: [{ conversation_id: session.id, role: "assistant", content: faqResult.answer }],
        prefer: "return=representation",
      });

      const assistantMsg = assistantRows[0];
      return {
        reply: faqResult.answer,
        messageId: assistantMsg?.id || `faq-${Date.now()}`,
        timestamp: assistantMsg?.created_at || new Date().toISOString(),
        provider: "faq_cache",
        cached: true,
      };
    }

    // 4. Save user message to Supabase
    await supabaseRequest<unknown>("messages", {
      method: "POST",
      body: [{ conversation_id: session.id, role: "user", content: sanitizedMessage }],
      prefer: "return=minimal",
    });

    // 5. Retrieve Grounded Knowledge Base Context
    const contextChunks = await KnowledgeService.retrieveContext(sanitizedMessage);

    // 6. Direct Google Gemini API generation
    const aiResponse = await GeminiService.generateGroundedReply(sanitizedMessage, contextChunks);

    // 7. Save AI assistant reply to Supabase
    const assistantRows = await supabaseRequest<MessageRow[]>("messages?select=id,created_at", {
      method: "POST",
      body: [{ conversation_id: session.id, role: "assistant", content: aiResponse.answer }],
      prefer: "return=representation",
    });

    const assistantMsg = assistantRows[0];
    if (!assistantMsg?.id || !assistantMsg.created_at) {
      throw new ApiError(503, "MESSAGE_SAVE_FAILED", "Failed to save AI assistant response.");
    }

    // 8. Update conversation timestamp
    await supabaseRequest<undefined>(`conversations?id=eq.${session.id}`, {
      method: "PATCH",
      body: { updated_at: new Date().toISOString() },
      prefer: "return=minimal",
    });

    return {
      reply: aiResponse.answer,
      messageId: assistantMsg.id,
      timestamp: assistantMsg.created_at,
      provider: aiResponse.provider,
      cached: false,
    };
  }

  /**
   * Retrieve chronological chat history for an authenticated session
   */
  static async getHistory(
    session: SessionContext,
    limitRaw?: unknown,
    offsetRaw?: unknown
  ): Promise<HistoryResult> {
    const limit = Math.min(Math.max(Number.parseInt(String(limitRaw ?? "50"), 10) || 50, 1), 500);
    const offset = Math.max(Number.parseInt(String(offsetRaw ?? "0"), 10) || 0, 0);

    const rows = await supabaseRequest<HistoryMessage[]>(
      `messages?conversation_id=eq.${session.id}` +
        `&select=id,role,content,created_at&order=created_at.asc,id.asc&limit=${limit + 1}&offset=${offset}`
    );

    const hasMore = rows.length > limit;
    const messages = rows.slice(0, limit);

    return {
      conversationId: session.id,
      messages,
      pagination: {
        limit,
        offset,
        hasMore,
      },
    };
  }
}
