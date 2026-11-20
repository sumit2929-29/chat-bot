import { supabaseRequest } from "../utils/supabase.js";
import { ApiError } from "../utils/apiError.js";
import { GeminiService } from "./gemini.service.js";
import { hashToken, generateSessionToken } from "../utils/crypto.js";
import type {
  ChatbotConfig,
  SuggestedQuestion,
  WidgetConversation,
  WidgetMessage,
} from "../types/index.js";

export class WidgetService {
  /**
   * Fetch public config and suggested questions for widget display
   */
  static async getPublicConfig(publicChatbotId: string) {
    const configs = await supabaseRequest<ChatbotConfig[]>(
      `chatbot_configs?public_chatbot_id=eq.${publicChatbotId}&select=id,website_id,public_chatbot_id,chatbot_name,welcome_message,placeholder_text,primary_color,secondary_color,background_color,text_color,font_family,logo_url,position,allowed_origins,is_published&limit=1`
    );

    const config = configs[0];
    if (!config || !config.is_published) {
      throw new ApiError(404, "WIDGET_NOT_FOUND", "Chatbot widget is inactive or not found.");
    }

    const questions = await supabaseRequest<SuggestedQuestion[]>(
      `suggested_questions?website_id=eq.${config.website_id}&is_active=eq.true&order=display_order.asc&limit=5`
    );

    return {
      config,
      suggestedQuestions: questions.map((q) => q.question_text),
    };
  }

  /**
   * Start or resume visitor session
   */
  static async startVisitorSession(publicChatbotId: string, visitorId?: string) {
    const configs = await supabaseRequest<ChatbotConfig[]>(
      `chatbot_configs?public_chatbot_id=eq.${publicChatbotId}&select=id,website_id,is_published&limit=1`
    );

    const config = configs[0];
    if (!config || !config.is_published) {
      throw new ApiError(404, "WIDGET_NOT_FOUND", "Chatbot widget not found.");
    }

    const effectiveVisitorId = visitorId?.trim() || `vis_${generateSessionToken().substring(0, 16)}`;
    const sessionToken = generateSessionToken();
    const tokenHash = hashToken(sessionToken);

    const convoRows = await supabaseRequest<WidgetConversation[]>("widget_conversations", {
      method: "POST",
      prefer: "return=representation",
      body: {
        website_id: config.website_id,
        public_chatbot_id: publicChatbotId,
        visitor_id: effectiveVisitorId,
        session_token_hash: tokenHash,
        status: "active",
      },
    });

    // Record widget open event
    try {
      await supabaseRequest("analytics_events", {
        method: "POST",
        body: {
          website_id: config.website_id,
          event_type: "widget_session_start",
          metadata: { visitor_id: effectiveVisitorId },
        },
      });
    } catch {
      // ignore
    }

    return {
      conversationId: convoRows[0]?.id || "live",
      visitorId: effectiveVisitorId,
      sessionToken,
    };
  }

  /**
   * Process a visitor message through Gemini with website-specific grounded context
   */
  static async handleVisitorMessage({
    publicChatbotId,
    message,
    conversationId,
  }: {
    publicChatbotId: string;
    message: string;
    conversationId?: string;
  }) {
    const cleanMessage = message?.trim();
    if (!cleanMessage) {
      throw new ApiError(400, "EMPTY_MESSAGE", "Message cannot be empty.");
    }

    if (cleanMessage.length > 800) {
      throw new ApiError(400, "MESSAGE_TOO_LONG", "Message cannot exceed 800 characters.");
    }

    // 1. Fetch Chatbot Config & Website Info
    const configs = await supabaseRequest<Array<ChatbotConfig & { websites?: { name: string } }>>(
      `chatbot_configs?public_chatbot_id=eq.${publicChatbotId}&select=id,website_id,chatbot_name,system_prompt_override,is_published&limit=1`
    );

    const config = configs[0];
    if (!config || !config.is_published) {
      throw new ApiError(404, "WIDGET_NOT_FOUND", "Chatbot widget is not active.");
    }

    const websiteName = config.chatbot_name || "Website Support";

    // 2. Retrieve Knowledge Context for Website
    let contextChunks: string[] = [];
    const sources: Array<{ title: string; url?: string }> = [];

    try {
      // First try stored procedure match_website_knowledge
      const matches = await supabaseRequest<
        Array<{ id: string; title: string; content: string; source_url?: string }>
      >("rpc/match_website_knowledge", {
        method: "POST",
        body: {
          p_website_id: config.website_id,
          p_query: cleanMessage,
          p_limit: 4,
        },
      });

      if (matches && matches.length > 0) {
        contextChunks = matches.map((m) => `[Document: ${m.title}]\n${m.content}`);
        matches.forEach((m) => {
          if (m.title && !sources.some((s) => s.title === m.title)) {
            sources.push({ title: m.title, url: m.source_url });
          }
        });
      }
    } catch {
      // Fallback: Query knowledge_documents directly with simple text match
      try {
        const directDocs = await supabaseRequest<
          Array<{ id: string; title: string; content: string; source_url?: string }>
        >(
          `knowledge_documents?website_id=eq.${config.website_id}&select=id,title,content,source_url&limit=3`
        );
        if (directDocs && directDocs.length > 0) {
          contextChunks = directDocs.map((d) => `[Document: ${d.title}]\n${d.content.substring(0, 800)}`);
          directDocs.forEach((d) => sources.push({ title: d.title, url: d.source_url }));
        }
      } catch (err) {
        console.warn("[WidgetService] Knowledge retrieval fallback:", err);
      }
    }

    // 3. Generate Gemini Grounded Reply
    const geminiResult = await GeminiService.generateWebsiteReply({
      websiteName,
      userMessage: cleanMessage,
      contextChunks,
      customSystemPrompt: config.system_prompt_override,
    });

    // 4. Save messages if conversationId is provided
    if (conversationId && conversationId !== "live") {
      try {
        await supabaseRequest<WidgetMessage[]>("widget_messages", {
          method: "POST",
          body: [
            {
              conversation_id: conversationId,
              role: "user",
              content: cleanMessage,
              sources: [],
            },
            {
              conversation_id: conversationId,
              role: "assistant",
              content: geminiResult.answer,
              sources,
            },
          ],
        });
      } catch (msgErr) {
        console.warn("[WidgetService] Failed to persist message:", msgErr);
      }
    }

    // 5. Track message sent analytics
    try {
      await supabaseRequest("analytics_events", {
        method: "POST",
        body: {
          website_id: config.website_id,
          event_type: "widget_message_sent",
          metadata: { query_length: cleanMessage.length, model: geminiResult.model },
        },
      });
    } catch {
      // ignore
    }

    return {
      answer: geminiResult.answer,
      sources,
      model: geminiResult.model,
      timestamp: new Date().toISOString(),
    };
  }
}
