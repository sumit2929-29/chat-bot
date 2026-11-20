import { supabaseRequest } from "../utils/supabase.js";
import { ApiError } from "../utils/apiError.js";
import { CrawlerService } from "./crawler.service.js";
import { ThemeDetectorService } from "./themeDetector.service.js";
import { GeminiService } from "./gemini.service.js";
import type {
  Website,
  ChatbotConfig,
  SuggestedQuestion,
  KnowledgeDocument,
  CrawledPage,
} from "../types/index.js";

export class WebsiteService {
  /**
   * Ensure user exists in public.users; returns the user ID.
   */
  static async getOrCreateUserId(clerkUserId?: string, email?: string): Promise<string> {
    const defaultEmail = email || (clerkUserId ? `${clerkUserId}@user.local` : "dev@supportai.local");

    try {
      const existing = await supabaseRequest<Array<{ id: string }>>(
        `users?email=eq.${encodeURIComponent(defaultEmail)}&select=id&limit=1`
      );
      if (existing && existing.length > 0) {
        return existing[0].id;
      }

      // Create new user
      const created = await supabaseRequest<Array<{ id: string }>>("users", {
        method: "POST",
        prefer: "return=representation",
        body: {
          clerk_user_id: clerkUserId || null,
          email: defaultEmail,
          name: defaultEmail.split("@")[0],
          role: "owner",
        },
      });

      if (created && created[0]) {
        return created[0].id;
      }
    } catch (err) {
      console.warn("[WebsiteService] getOrCreateUserId fallback:", err);
    }

    // Fallback fixed dev user UUID
    return "00000000-0000-0000-0000-000000000001";
  }

  /**
   * Create a new website, run crawler and auto-detect theme & suggested questions
   */
  static async createWebsite({
    userId,
    name,
    url,
  }: {
    userId: string;
    name?: string;
    url: string;
  }): Promise<{
    website: Website;
    chatbotConfig: ChatbotConfig;
    pagesCrawled: number;
    suggestedQuestions: string[];
  }> {
    const safeUrl = CrawlerService.validateSafeUrl(url);
    const domain = safeUrl.hostname;
    const initialName = name?.trim() || domain;

    // 1. Fetch homepage HTML for quick theme extraction
    let homepageHtml = "";
    try {
      homepageHtml = await CrawlerService.fetchHtml(safeUrl.href, 6000);
    } catch {
      // Continue even if initial fetch is delayed
    }

    const detectedTheme = homepageHtml
      ? ThemeDetectorService.extractTheme(homepageHtml, safeUrl)
      : {
          primaryColor: "#0F172A",
          secondaryColor: "#3B82F6",
          backgroundColor: "#FFFFFF",
          textColor: "#1E293B",
          fontFamily: "Inter, system-ui, sans-serif",
          logoUrl: `${safeUrl.origin}/favicon.ico`,
          brandName: initialName,
        };

    const finalName = name?.trim() || detectedTheme.brandName || domain;

    // 2. Insert Website Record
    const websiteRows = await supabaseRequest<Website[]>("websites", {
      method: "POST",
      prefer: "return=representation",
      body: {
        user_id: userId,
        name: finalName,
        url: safeUrl.href,
        domain,
        crawl_status: "in_progress",
      },
    });

    const website = websiteRows[0];
    if (!website) {
      throw new ApiError(500, "CREATE_FAILED", "Failed to create website profile.");
    }

    // 3. Create Default Chatbot Config
    const publicChatbotId = `bot_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const configRows = await supabaseRequest<ChatbotConfig[]>("chatbot_configs", {
      method: "POST",
      prefer: "return=representation",
      body: {
        website_id: website.id,
        public_chatbot_id: publicChatbotId,
        chatbot_name: `${finalName} Assistant`,
        welcome_message: `Hi there! 👋 Welcome to ${finalName}. How can I help you today?`,
        placeholder_text: "Ask anything about our services...",
        primary_color: detectedTheme.primaryColor,
        secondary_color: detectedTheme.secondaryColor,
        background_color: "#FFFFFF",
        text_color: "#1E293B",
        font_family: detectedTheme.fontFamily,
        logo_url: detectedTheme.logoUrl,
        position: "bottom-right",
        allowed_origins: ["*"],
        is_published: true,
      },
    });

    const chatbotConfig = configRows[0];

    // 4. Crawl pages (homepage + internal links)
    let crawledPages: Array<{ title: string; cleanText: string; url: string }> = [];
    try {
      crawledPages = await CrawlerService.crawlWebsite(website.id, safeUrl.href, 6);
      await supabaseRequest(`websites?id=eq.${website.id}`, {
        method: "PATCH",
        body: {
          crawl_status: "completed",
          last_crawled_at: new Date().toISOString(),
        },
      });
    } catch (crawlErr) {
      console.warn("[WebsiteService] Crawling error:", crawlErr);
      await supabaseRequest(`websites?id=eq.${website.id}`, {
        method: "PATCH",
        body: {
          crawl_status: "completed",
          last_crawled_at: new Date().toISOString(),
        },
      });
    }

    // 5. Generate Smart Suggested Questions with Gemini
    const summaries = crawledPages.map((p) => `${p.title}: ${p.cleanText.substring(0, 300)}`);
    const questions = await GeminiService.generateSuggestedQuestions(finalName, summaries);

    for (let i = 0; i < questions.length; i++) {
      try {
        await supabaseRequest("suggested_questions", {
          method: "POST",
          body: {
            website_id: website.id,
            question_text: questions[i],
            display_order: i,
            is_active: true,
          },
        });
      } catch {
        // ignore duplicate
      }
    }

    return {
      website: {
        ...website,
        crawl_status: "completed",
      },
      chatbotConfig: chatbotConfig || {
        id: "default",
        website_id: website.id,
        public_chatbot_id: publicChatbotId,
        chatbot_name: `${finalName} Assistant`,
        welcome_message: `Hi there! 👋 Welcome to ${finalName}. How can I help you today?`,
        placeholder_text: "Ask anything about our services...",
        primary_color: detectedTheme.primaryColor,
        secondary_color: detectedTheme.secondaryColor,
        background_color: "#FFFFFF",
        text_color: "#1E293B",
        font_family: detectedTheme.fontFamily,
        logo_url: detectedTheme.logoUrl,
        position: "bottom-right",
        allowed_origins: ["*"],
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      pagesCrawled: crawledPages.length,
      suggestedQuestions: questions,
    };
  }

  /**
   * List websites for user
   */
  static async listWebsites(userId: string): Promise<Website[]> {
    const rows = await supabaseRequest<Website[]>(
      `websites?select=id,user_id,name,url,domain,description,crawl_status,last_crawled_at,created_at,updated_at&order=created_at.desc&limit=50`
    );
    return rows || [];
  }

  /**
   * Get single website details with config and questions
   */
  static async getWebsiteDetails(websiteId: string) {
    const websites = await supabaseRequest<Website[]>(`websites?id=eq.${websiteId}&limit=1`);
    const website = websites[0];
    if (!website) {
      throw new ApiError(404, "NOT_FOUND", "Website not found.");
    }

    const configs = await supabaseRequest<ChatbotConfig[]>(`chatbot_configs?website_id=eq.${websiteId}&limit=1`);
    const questions = await supabaseRequest<SuggestedQuestion[]>(
      `suggested_questions?website_id=eq.${websiteId}&order=display_order.asc`
    );
    const pages = await supabaseRequest<CrawledPage[]>(
      `crawled_pages?website_id=eq.${websiteId}&select=id,url,path,title,description,created_at&order=created_at.desc&limit=20`
    );
    const docs = await supabaseRequest<KnowledgeDocument[]>(
      `knowledge_documents?website_id=eq.${websiteId}&select=id,title,source_type,source_url,created_at&order=created_at.desc&limit=30`
    );

    return {
      website,
      chatbotConfig: configs[0] || null,
      suggestedQuestions: questions || [],
      crawledPages: pages || [],
      knowledgeDocuments: docs || [],
    };
  }

  /**
   * Update chatbot customization
   */
  static async updateChatbotConfig(
    websiteId: string,
    updates: Partial<ChatbotConfig>
  ): Promise<ChatbotConfig> {
    const allowed = [
      "chatbot_name",
      "welcome_message",
      "placeholder_text",
      "primary_color",
      "secondary_color",
      "background_color",
      "text_color",
      "font_family",
      "logo_url",
      "position",
      "allowed_origins",
      "is_published",
      "system_prompt_override",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowed) {
      if ((updates as Record<string, unknown>)[key] !== undefined) {
        sanitized[key] = (updates as Record<string, unknown>)[key];
      }
    }

    const rows = await supabaseRequest<ChatbotConfig[]>(`chatbot_configs?website_id=eq.${websiteId}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: sanitized,
    });

    if (!rows || rows.length === 0) {
      throw new ApiError(404, "CONFIG_NOT_FOUND", "Chatbot configuration not found.");
    }

    return rows[0];
  }

  /**
   * Add a manual knowledge document or FAQ
   */
  static async addKnowledgeDoc(
    websiteId: string,
    { title, content, sourceType }: { title: string; content: string; sourceType?: "manual_doc" | "faq" }
  ): Promise<KnowledgeDocument> {
    if (!title?.trim() || !content?.trim()) {
      throw new ApiError(400, "INVALID_INPUT", "Title and content are required.");
    }

    const rows = await supabaseRequest<KnowledgeDocument[]>("knowledge_documents", {
      method: "POST",
      prefer: "return=representation",
      body: {
        website_id: websiteId,
        title: title.trim(),
        content: content.trim(),
        source_type: sourceType || "manual_doc",
      },
    });

    return rows[0];
  }

  /**
   * Re-crawl website
   */
  static async recrawlWebsite(websiteId: string): Promise<number> {
    const websites = await supabaseRequest<Website[]>(`websites?id=eq.${websiteId}&limit=1`);
    const website = websites[0];
    if (!website) {
      throw new ApiError(404, "NOT_FOUND", "Website not found.");
    }

    await supabaseRequest(`websites?id=eq.${websiteId}`, {
      method: "PATCH",
      body: { crawl_status: "in_progress" },
    });

    const pages = await CrawlerService.crawlWebsite(websiteId, website.url, 8);

    await supabaseRequest(`websites?id=eq.${websiteId}`, {
      method: "PATCH",
      body: {
        crawl_status: "completed",
        last_crawled_at: new Date().toISOString(),
      },
    });

    return pages.length;
  }
}
