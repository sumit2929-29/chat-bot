import { supabaseRequest } from "../utils/supabase.js";

interface KnowledgeChunkRpcRow {
  chunk_id: string;
  document_title: string;
  document_category: string;
  content: string;
}

const IN_MEMORY_INSTITUTIONAL_DOCS = [
  {
    title: "Curious Rabit AI Solutions Platform Overview",
    category: "general",
    keywords: ["services", "about", "company", "what do you do", "who are you", "curious rabit"],
    content:
      "Curious Rabit is an AI solutions company engineering focused, high-impact products for real-world business operations. We provide AI automation, client support chatbots, workflow integrations, and cloud engineering services.",
  },
  {
    title: "Subscription and Pricing Plans",
    category: "pricing",
    keywords: ["price", "pricing", "cost", "plan", "subscription", "starter", "tier", "rate"],
    content:
      "Curious Rabit offers transparent SaaS pricing tiers: Starter Plan begins at $29/month (includes basic support chatbot and up to 1,000 monthly conversations), Professional Plan is $99/month (includes multi-channel routing, advanced analytics, and custom LLM fine-tuning), and Enterprise custom tiers are tailored for high-volume enterprise workloads.",
  },
  {
    title: "Client Portal Login & Access",
    category: "access",
    keywords: ["login", "portal", "account", "access", "signin", "password"],
    content:
      "Clients can access the administrative dashboard at https://app.curiousrabit.com using Clerk-authenticated email or Google SSO. Public visitors do not require login; they receive instant frictionless guest chat sessions.",
  },
  {
    title: "Chatbot Usage Limits & Quota",
    category: "policy",
    keywords: ["limit", "quota", "daily", "messages", "how many", "429"],
    content:
      "To ensure fair usage and prevent abuse, public visitor chat sessions are limited to 8 messages per 24 hours. Messages are capped at 400 characters each. If a visitor exceeds this limit, they receive an official 429 quota notice: 'You have reached today's chat limit. Please check back tomorrow or contact support.'",
  },
  {
    title: "Support Escalation & Contact Information",
    category: "support",
    keywords: ["contact", "support", "help", "email", "phone", "agent", "human", "talk"],
    content:
      "For personalized human assistance or technical escalation, contact the official support desk at support@curiousrabit.com or phone +1-800-CURIOUS during operating hours (Mon-Fri 9:00 AM - 6:00 PM EST).",
  },
];

export class KnowledgeService {
  /**
   * Retrieve relevant knowledge base chunks for grounding Gemini responses.
   * Checks Supabase RPC first, falls back gracefully to verified institutional documents.
   */
  static async retrieveContext(query: string, limit = 3): Promise<string[]> {
    const cleanQuery = query.toLowerCase().trim();

    // 1. Try Supabase PostgREST RPC if database table is available
    try {
      const rpcResults = await supabaseRequest<KnowledgeChunkRpcRow[]>("rpc/match_knowledge_chunks", {
        method: "POST",
        body: {
          p_query: cleanQuery,
          p_limit: limit,
        },
        timeoutMs: 3000,
      });

      if (Array.isArray(rpcResults) && rpcResults.length > 0) {
        return rpcResults.map((r) => `[${r.document_title} - ${r.document_category}]: ${r.content}`);
      }
    } catch {
      // PostgREST RPC might not be deployed yet; fallback to in-memory verified documents
    }

    // 2. In-memory verified document retrieval
    const queryTokens = cleanQuery
      .split(/\s+/)
      .map((t) => t.replace(/[^a-z0-9]/g, ""))
      .filter((t) => t.length > 2);

    const matches = IN_MEMORY_INSTITUTIONAL_DOCS.map((doc) => {
      let score = 0;
      for (const kw of doc.keywords) {
        if (cleanQuery.includes(kw)) score += 3;
      }
      for (const token of queryTokens) {
        if (doc.content.toLowerCase().includes(token)) score += 1;
        if (doc.title.toLowerCase().includes(token)) score += 2;
      }
      return { doc, score };
    })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => `[${item.doc.title}]: ${item.doc.content}`);

    return matches;
  }
}
