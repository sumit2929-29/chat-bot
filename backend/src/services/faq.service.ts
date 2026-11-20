import { supabaseRequest } from "../utils/supabase.js";

export interface FaqMatchResult {
  hit: boolean;
  question?: string;
  answer?: string;
  category?: string;
  source?: "database_cache" | "in_memory_cache";
}

interface RpcFaqResponse {
  hit: boolean;
  id?: string;
  question?: string;
  answer?: string;
  category?: string;
}

// Built-in verified institutional fallback cache for instant sub-millisecond retrieval
const IN_MEMORY_VERIFIED_FAQS = [
  {
    patterns: [/^(hi|hii|hello|hey|hola|namaste|greetings)\b/i, /^(good\s+(morning|afternoon|evening))/i],
    question: "Greetings & Welcome",
    answer: "Hello! I am Aura, your Curious Rabit AI Client Support Assistant. How can I help you today with our services, pricing plans, or client portal?",
    category: "general",
  },
  {
    patterns: [/(tum\s+kon\s+ho|who\s+are\s+you|aap\s+kaun\s+hai|what\s+is\s+your\s+name)/i],
    question: "Assistant Identity",
    answer: "Main Curious Rabit AI Solutions ka official client support assistant hoon. Main aapko hamari AI automation services, pricing plans aur technical solutions ke baare me guide kar sakta hoon. Aap mujhse hamare plans aur services ke baare me pooch sakte hain!",
    category: "general",
  },
  {
    patterns: [/pricing/i, /cost/i, /subscription/i, /tiers/i],
    question: "How does the platform pricing work?",
    answer: "Our SaaS tiers start at $29/mo for the Starter plan and $99/mo for the Professional tier with full SLA. Enterprise plans are customized for high-volume requirements.",
    category: "pricing",
  },
  {
    patterns: [/services/i, /what\s+do\s+you\s+do/i, /features/i, /kya\s+karte\s+ho/i],
    question: "What services do you provide?",
    answer: "We provide AI automation, client support chatbots, workflow integrations, and scalable cloud engineering services.",
    category: "services",
  },
  {
    patterns: [/fee/i, /tuition/i, /payment\s+deadline/i, /due\s+date/i],
    question: "What is the fee payment deadline?",
    answer: "Payment must be cleared prior to the 15th of each billing month. Please check your billing dashboard for detailed invoices.",
    category: "finance",
  },
  {
    patterns: [/reset\s+password/i, /login\s+issue/i, /portal\s+login/i, /cannot\s+login/i],
    question: "How do I access the client portal?",
    answer: "You can sign in to the administrative portal at https://app.curiousrabit.com using your registered email or Google SSO.",
    category: "support",
  },
  {
    patterns: [/contact/i, /support\s+email/i, /customer\s+care/i, /phone/i, /human\s+support/i],
    question: "How do I reach human support?",
    answer: "You can reach our team at support@curiousrabit.com or call +1-800-CURIOUS (Mon-Fri 9:00 AM - 6:00 PM EST).",
    category: "support",
  },
];

export class FaqService {
  /**
   * Looks up verified FAQ cache before calling external LLM providers.
   * Returns instant verified answer if found.
   */
  static async checkFaqCache(query: string): Promise<FaqMatchResult> {
    const cleanQuery = query.trim().toLowerCase();

    // 1. Try Supabase FAQ Cache via RPC (persisted and tracked)
    try {
      const rpcResult = await supabaseRequest<RpcFaqResponse>("rpc/lookup_faq_cache", {
        method: "POST",
        body: { p_query: cleanQuery },
      });

      if (rpcResult && rpcResult.hit && rpcResult.answer) {
        return {
          hit: true,
          question: rpcResult.question,
          answer: rpcResult.answer,
          category: rpcResult.category,
          source: "database_cache",
        };
      }
    } catch {
      // Database cache lookup failed or table not yet created; proceed to in-memory check
    }

    // 2. Fallback to In-Memory Verified Cache (instant zero-token answer)
    for (const faq of IN_MEMORY_VERIFIED_FAQS) {
      if (faq.patterns.some((pattern) => pattern.test(cleanQuery))) {
        return {
          hit: true,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          source: "in_memory_cache",
        };
      }
    }

    return { hit: false };
  }
}
