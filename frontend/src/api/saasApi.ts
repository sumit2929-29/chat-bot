export interface WebsiteData {
  id: string;
  name: string;
  url: string;
  domain: string;
  crawl_status: "idle" | "in_progress" | "completed" | "failed";
  last_crawled_at?: string;
  created_at: string;
}

export interface ChatbotConfigData {
  id: string;
  website_id: string;
  public_chatbot_id: string;
  chatbot_name: string;
  welcome_message: string;
  placeholder_text: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  logo_url?: string;
  position: "bottom-right" | "bottom-left";
  allowed_origins: string[];
  is_published: boolean;
}

export interface CrawledPageData {
  id: string;
  url: string;
  path: string;
  title: string;
  description: string;
  created_at: string;
}

export interface KnowledgeDocData {
  id: string;
  title: string;
  source_type: "crawled_page" | "manual_doc" | "faq";
  source_url?: string;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchWebsites(): Promise<WebsiteData[]> {
  try {
    const res = await fetch(`${API_BASE}/websites`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load websites");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchWebsites fallback to local demo data:", err);
    return [
      {
        id: "demo-site-1",
        name: "Acme Corp",
        url: "https://acme.example.com",
        domain: "acme.example.com",
        crawl_status: "completed",
        last_crawled_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ];
  }
}

export async function createWebsite(url: string, name?: string) {
  const res = await fetch(`${API_BASE}/websites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to create and crawl website");
  }
  return await res.json();
}

export async function fetchWebsiteDetails(id: string) {
  try {
    const res = await fetch(`${API_BASE}/websites/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load website details");
    const json = await res.json();
    return json.data;
  } catch {
    return {
      website: {
        id,
        name: "Acme Corp",
        url: "https://acme.example.com",
        domain: "acme.example.com",
        crawl_status: "completed",
      },
      chatbotConfig: {
        id: "cfg-1",
        website_id: id,
        public_chatbot_id: "bot_demo12345678",
        chatbot_name: "Acme Support Assistant",
        welcome_message: "Hi there! Welcome to Acme Corp. How can I help you today?",
        placeholder_text: "Ask anything about Acme...",
        primary_color: "#0F172A",
        secondary_color: "#3B82F6",
        background_color: "#FFFFFF",
        text_color: "#1E293B",
        font_family: "Inter, system-ui, sans-serif",
        position: "bottom-right",
        allowed_origins: ["*"],
        is_published: true,
      },
      suggestedQuestions: [
        { id: "1", question_text: "What services does Acme provide?" },
        { id: "2", question_text: "How do I contact customer support?" },
        { id: "3", question_text: "What are your pricing plans?" },
      ],
      crawledPages: [
        { id: "p1", url: "https://acme.example.com", path: "/", title: "Acme Corp - Home" },
        { id: "p2", url: "https://acme.example.com/about", path: "/about", title: "About Acme" },
        { id: "p3", url: "https://acme.example.com/pricing", path: "/pricing", title: "Pricing & Plans" },
      ],
      knowledgeDocuments: [
        { id: "d1", title: "Acme Corp - Home", source_type: "crawled_page" },
        { id: "d2", title: "About Acme", source_type: "crawled_page" },
      ],
    };
  }
}

export async function updateChatbotConfig(websiteId: string, updates: Partial<ChatbotConfigData>) {
  const res = await fetch(`${API_BASE}/websites/${websiteId}/chatbot`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update chatbot configuration");
  return await res.json();
}

export async function addKnowledgeDoc(
  websiteId: string,
  title: string,
  content: string,
  sourceType: "manual_doc" | "faq" = "manual_doc"
) {
  const res = await fetch(`${API_BASE}/websites/${websiteId}/knowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, sourceType }),
  });
  if (!res.ok) throw new Error("Failed to add knowledge document");
  return await res.json();
}
