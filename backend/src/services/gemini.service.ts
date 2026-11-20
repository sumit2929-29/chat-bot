import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export interface GroundedReplyResult {
  answer: string;
  provider: "gemini_api" | "grounded_fallback";
  model: string;
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

/**
 * Gemini Service
 * Direct integration with Google Gemini API via official @google/genai SDK
 * with automatic model failover between fast models (gemini-3.5-flash-lite, gemini-3.8-flash).
 * Supports multi-tenant website grounded Q&A and automated question generation.
 */
export class GeminiService {
  private static client: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI {
    if (!this.client) {
      if (!env.gemini.isConfigured) {
        throw new ApiError(503, "AI_UNAVAILABLE", "Gemini API key is not configured.");
      }
      this.client = new GoogleGenAI({ apiKey: env.gemini.apiKey });
    }
    return this.client;
  }

  /**
   * Multi-Tenant Website Grounded Q&A
   */
  static async generateWebsiteReply({
    websiteName,
    userMessage,
    contextChunks,
    customSystemPrompt,
    conversationHistory = [],
  }: {
    websiteName: string;
    userMessage: string;
    contextChunks: string[];
    customSystemPrompt?: string | null;
    conversationHistory?: ChatHistoryItem[];
  }): Promise<GroundedReplyResult> {
    if (!env.gemini.isConfigured) {
      return {
        answer: "I do not have verified information on this topic. Please contact support for assistance.",
        provider: "grounded_fallback",
        model: env.gemini.model,
      };
    }

    const ai = this.getClient();

    const systemInstruction =
      customSystemPrompt?.trim() ||
      `You are the official AI Support Assistant for "${websiteName}".
Your role is to help visitors by answering questions accurately based strictly on the provided website knowledge base.

Rules:
1. Greetings: If the visitor says hello, hi, introduces themselves, or asks who you are, greet them warmly in the same language and introduce yourself as the ${websiteName} Assistant.
2. Grounded Answers: Answer questions using ONLY the provided verified website context below. If facts are not in the context, do not make up or assume answers. Politely reply:
"I do not have verified information on this topic. Please contact our support team for more details."
3. Formatting: Use clean, concise, polite formatting. Keep answers straightforward and readable.
4. Language: Match the visitor's language (e.g. English, Spanish, Hindi, French).`;

    const contextText =
      contextChunks.length > 0
        ? `=== VERIFIED WEBSITE KNOWLEDGE BASE ===\n${contextChunks.join("\n\n---\n\n")}\n=== END KNOWLEDGE BASE ===`
        : "No direct knowledge chunks retrieved. Answer only conversational greetings or assistant identity.";

    // Format previous turns for context
    const historyText =
      conversationHistory.length > 0
        ? `\n=== RECENT CONVERSATION HISTORY ===\n` +
          conversationHistory
            .slice(-4)
            .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
            .join("\n") +
          `\n=== END HISTORY ===\n`
        : "";

    const prompt = `${contextText}${historyText}\n\nVisitor Question: ${userMessage}\n\nAssistant Response:`;

    // Prioritized fast and resilient models
    const modelsToTry = Array.from(
      new Set([
        env.gemini.model || "gemini-3.5-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-3.6-flash",
      ])
    );

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            maxOutputTokens: env.gemini.maxOutputTokens,
            temperature: 0.3,
          },
        });

        const text = response.text?.trim();
        if (text) {
          return {
            answer: text,
            provider: "gemini_api",
            model: modelName,
          };
        }
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.warn(`[GeminiService] Model ${modelName} failed, trying next model. Error:`, errMsg.substring(0, 100));
      }
    }

    return {
      answer: "I do not have verified information on this topic. Please contact support for assistance.",
      provider: "grounded_fallback",
      model: env.gemini.model,
    };
  }

  /**
   * Automatically generate 3-5 smart suggested questions based on website content
   */
  static async generateSuggestedQuestions(websiteName: string, contentSummaries: string[]): Promise<string[]> {
    if (!env.gemini.isConfigured || contentSummaries.length === 0) {
      return [
        `What services does ${websiteName} offer?`,
        "How can I contact customer support?",
        "What are your pricing plans?",
      ];
    }

    const ai = this.getClient();
    const prompt = `Based on the following content summary of the website "${websiteName}", generate 3 to 4 short, relevant questions that visitors are most likely to ask.
Return ONLY a valid JSON array of strings, for example: ["Question 1?", "Question 2?", "Question 3?"]

Website Content Summary:
${contentSummaries.slice(0, 3).join("\n\n")}`;

    try {
      const response = await ai.models.generateContent({
        model: env.gemini.model || "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 256,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 4).map((q) => String(q).trim());
        }
      }
    } catch (err) {
      console.warn("[GeminiService] Question generation fallback:", err);
    }

    return [
      `What services does ${websiteName} offer?`,
      "How can I contact customer support?",
      "What are your pricing plans?",
    ];
  }

  /**
   * Backwards compatible method for existing internal routes/tests
   */
  static async generateGroundedReply(
    userMessage: string,
    contextChunks: string[]
  ): Promise<GroundedReplyResult> {
    return this.generateWebsiteReply({
      websiteName: "Curious Rabit AI Solutions",
      userMessage,
      contextChunks,
    });
  }
}
