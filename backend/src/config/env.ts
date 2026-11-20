import dotenv from "dotenv";
import { ApiError } from "../utils/apiError.js";

// Load environment variables (.env.local has priority)
dotenv.config({ path: ".env.local" });
dotenv.config();

export interface AppEnv {
  port: number;
  supabase: {
    url: string;
    serviceRoleKey: string;
  };
  gemini: {
    apiKey: string;
    model: string;
    timeoutMs: number;
    maxOutputTokens: number;
    isConfigured: boolean;
  };
  chatConfig: {
    dailyMessageLimit: number;
    maxMessageLength: number;
  };
  clerk: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
    isConfigured: boolean;
  };
  security: {
    allowedOrigin: string;
    rateLimitMaxRequests: number;
    rateLimitWindowSeconds: number;
    sessionCookieSameSite: "lax" | "strict" | "none";
  };
}

function getRequiredEnv(key: string, description: string): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new ApiError(503, "CONFIG_ERROR", `${description} (${key}) is missing in .env.local.`);
  }
  return value;
}

export function loadEnv(): AppEnv {
  const port = Number.parseInt(process.env.PORT ?? "5000", 10);

  // Supabase Database Configuration
  const supabaseUrlRaw = getRequiredEnv("SUPABASE_URL", "Supabase URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY", "Supabase Service Role Key");

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(supabaseUrlRaw);
  } catch {
    throw new ApiError(503, "CONFIG_ERROR", "SUPABASE_URL must be a valid URL.");
  }
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(parsedUrl.hostname);
  if (parsedUrl.protocol !== "https:" && !isLocal) {
    throw new ApiError(503, "CONFIG_ERROR", "SUPABASE_URL must use HTTPS.");
  }

  // Google Gemini API Configuration (Direct SDK)
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim() ?? "";
  const geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
  const geminiTimeoutMs = Number.parseInt(process.env.GEMINI_TIMEOUT_MS ?? "30000", 10);
  const geminiMaxOutputTokens = Number.parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS ?? "1024", 10);

  // Chatbot Limits
  const dailyMessageLimit = Number.parseInt(process.env.DAILY_MESSAGE_LIMIT ?? "8", 10);
  const maxMessageLength = Number.parseInt(process.env.MAX_MESSAGE_LENGTH ?? "400", 10);

  // Clerk Dashboard Authentication Configuration
  const clerkSecretKey = process.env.CLERK_SECRET_KEY?.trim() ?? "";
  const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY?.trim() ?? "";
  const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET?.trim() ?? "";

  // Rate Limiting & CORS
  const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim() || "http://localhost:3000";
  const rateLimitMaxRequests = Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "20", 10);
  const rateLimitWindowSeconds = Number.parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS ?? "60", 10);
  const sessionCookieSameSite = (process.env.SESSION_COOKIE_SAME_SITE?.trim() || "lax").toLowerCase() as "lax" | "strict" | "none";

  return {
    port,
    supabase: {
      url: parsedUrl.origin,
      serviceRoleKey,
    },
    gemini: {
      apiKey: geminiApiKey,
      model: geminiModel,
      timeoutMs: Number.isInteger(geminiTimeoutMs) && geminiTimeoutMs >= 1000 ? geminiTimeoutMs : 30000,
      maxOutputTokens: Number.isInteger(geminiMaxOutputTokens) && geminiMaxOutputTokens > 0 ? geminiMaxOutputTokens : 1024,
      isConfigured: Boolean(geminiApiKey && !geminiApiKey.includes("your_google_ai_studio_api_key")),
    },
    chatConfig: {
      dailyMessageLimit: Number.isInteger(dailyMessageLimit) && dailyMessageLimit > 0 ? dailyMessageLimit : 8,
      maxMessageLength: Number.isInteger(maxMessageLength) && maxMessageLength > 0 ? maxMessageLength : 400,
    },
    clerk: {
      secretKey: clerkSecretKey,
      publishableKey: clerkPublishableKey,
      webhookSecret: clerkWebhookSecret,
      isConfigured: Boolean(clerkSecretKey && clerkPublishableKey),
    },
    security: {
      allowedOrigin,
      rateLimitMaxRequests: Number.isInteger(rateLimitMaxRequests) ? rateLimitMaxRequests : 20,
      rateLimitWindowSeconds: Number.isInteger(rateLimitWindowSeconds) ? rateLimitWindowSeconds : 60,
      sessionCookieSameSite: ["lax", "strict", "none"].includes(sessionCookieSameSite) ? sessionCookieSameSite : "lax",
    },
  };
}

export const env = loadEnv();
