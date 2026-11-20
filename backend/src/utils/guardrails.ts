import { ApiError } from "./apiError.js";

export interface GuardrailCheckResult {
  isValid: boolean;
  sanitizedMessage: string;
  rejectionReason?: string;
  directAnswer?: string;
}

// Prompt Injection and Jailbreak patterns
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|prompts)/i,
  /disregard\s+(all\s+)?(previous|prior)\s+(instructions|prompts)/i,
  /reveal\s+(your\s+)?(system\s+prompt|internal\s+instructions|instructions|secret)/i,
  /what\s+are\s+your\s+(internal\s+instructions|system\s+prompt)/i,
  /act\s+as\s+(an?\s+)?(unrestricted|jailbroken|dan|evil|developer\s+mode)/i,
  /bypass\s+(all\s+)?(filters|safety|guardrails)/i,
  /show\s+me\s+(your\s+)?(api\s+key|credentials|backend\s+keys)/i,
];

// Academic Assignment & Arbitrary Code generation filters
const ACADEMIC_ASSIGNMENT_PATTERNS = [
  /(solve|complete|do|write|generate|create)\s+.*(assignment|homework|exam|quiz|coursework|essay|equation)/i,
  /(write|generate|create|give\s+me)\s+.*(python|javascript|c\+\+|java|rust|php|sql|bash)\s+(program|script|code)/i,
  /give\s+me\s+the\s+answers\s+to\s+test/i,
];

/**
 * Strips HTML tags and unsafe script characters to prevent Stored XSS
 */
export function sanitizeHtmlContent(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/onload\s*=/gi, "")
    .replace(/onerror\s*=/gi, "")
    .trim();
}

/**
 * Validates message length, structure, prompt injection, and assignment requests
 */
export function validateAndGuardMessage(rawMessage: unknown): GuardrailCheckResult {
  if (typeof rawMessage !== "string") {
    throw new ApiError(400, "INVALID_PAYLOAD", "Message must be a text string.");
  }

  const trimmed = rawMessage.trim();
  if (!trimmed) {
    throw new ApiError(400, "MESSAGE_REQUIRED", "Please enter a message.");
  }

  // Maximum message length strictly 400 characters
  if (trimmed.length > 400) {
    throw new ApiError(
      400,
      "MESSAGE_TOO_LONG",
      `Message length (${trimmed.length} chars) exceeds the 400-character maximum limit.`
    );
  }

  // 1. Sanitize to prevent HTML injection / XSS
  const sanitized = sanitizeHtmlContent(trimmed);
  if (!sanitized) {
    throw new ApiError(400, "INVALID_CONTENT", "Message contains only invalid or stripped characters.");
  }

  // 2. Prompt Injection Detection
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        isValid: false,
        sanitizedMessage: sanitized,
        rejectionReason: "PROMPT_INJECTION_DETECTED",
        directAnswer:
          "I am an official support assistant. I can only assist with verified support and operational queries. I cannot alter my system instructions, bypass security guidelines, or reveal internal configurations.",
      };
    }
  }

  // 3. Academic Assignment & Code Writing Detection
  for (const pattern of ACADEMIC_ASSIGNMENT_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        isValid: false,
        sanitizedMessage: sanitized,
        rejectionReason: "ACADEMIC_INTEGRITY_POLICY",
        directAnswer:
          "As an official client support assistant, I cannot solve academic assignments, complete coursework, or write arbitrary programming code. Please refer to course materials or faculty for academic guidance.",
      };
    }
  }

  return {
    isValid: true,
    sanitizedMessage: sanitized,
  };
}
