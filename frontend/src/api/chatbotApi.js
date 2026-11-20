const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Default fallback configuration & state for frontend UI
let mockConfig = {
  mode: "CUSTOM_QUESTIONS",
  assistantName: "Aura",
  theme: "dark",
  unlockChatAfter: 1,
  requireLeadCapture: true,
  askEmail: true,
  askPhone: false,
};

let mockQuestions = [
  { id: "q1", text: "How does the platform pricing work?", answer: "Our SaaS tiers start at $29/mo." },
  { id: "q2", text: "What services do you provide?", answer: "We provide AI automation, client support chatbots, and cloud engineering." },
];

/**
 * Fetch Chatbot Configuration from Backend
 * GET /api/config
 */
export const fetchChatbotConfig = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/config`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      if (data.config) {
        mockConfig = { ...mockConfig, ...data.config };
        return mockConfig;
      }
    }
  } catch (err) {
    console.warn("Backend not reachable for config, using default config", err);
  }
  return mockConfig;
};

/**
 * Fetch Predefined Questions from Backend
 * GET /api/config
 */
export const fetchPredefinedQuestions = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/config`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        mockQuestions = data.questions;
        return mockQuestions;
      }
    }
  } catch (err) {
    console.warn("Backend not reachable for questions, using default questions", err);
  }
  return mockQuestions;
};

/**
 * Save Admin Configuration to Backend
 * POST /api/config
 */
export const saveAdminConfig = async (newConfig, newQuestions) => {
  try {
    const res = await fetch(`${API_BASE_URL}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        config: newConfig,
        questions: newQuestions,
      }),
    });

    if (res.ok) {
      mockConfig = { ...mockConfig, ...newConfig };
      mockQuestions = [...newQuestions];
      return { success: true };
    }
  } catch (err) {
    console.warn("Backend not reachable for saving config, saving locally", err);
  }

  mockConfig = { ...mockConfig, ...newConfig };
  mockQuestions = [...newQuestions];
  return { success: true };
};

/**
 * Start Session with Backend API
 * POST /api/session/start
 * Automatically receives and stores HttpOnly session cookie
 */
export const startSession = async (email, consentStatus = true) => {
  try {
    const res = await fetch(`${API_BASE_URL}/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, consent_status: consentStatus }),
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("chatbot_conversation_id", data.conversation_id);
        localStorage.setItem("chatbot_client_id", data.client_id);
      }
      return data;
    }
  } catch (err) {
    console.warn("Backend not reachable for session start, using fallback session", err);
  }
  return { client_id: "guest-id", conversation_id: "local-session-id" };
};

/**
 * Fetch Chat History from Backend
 * GET /api/chat/history?conversation_id=...
 */
export const fetchChatHistory = async (conversationId) => {
  try {
    const convId = conversationId || (typeof window !== "undefined" && localStorage.getItem("chatbot_conversation_id"));
    if (!convId) return [];

    const res = await fetch(`${API_BASE_URL}/chat/history?conversation_id=${convId}&limit=50`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      return (data.messages || []).map((m) => ({
        id: m.id,
        sender: m.role === "user" ? "user" : "ai",
        text: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
    }
  } catch (err) {
    console.warn("Could not fetch backend history, using empty array", err);
  }
  return [];
};

/**
 * Send Message to Backend API (Dify RAG + Gemini LLM)
 * POST /api/chat/message
 */
export const sendMessage = async (message, conversationId) => {
  const convId = conversationId || (typeof window !== "undefined" && localStorage.getItem("chatbot_conversation_id"));

  try {
    const res = await fetch(`${API_BASE_URL}/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        conversation_id: convId,
        message,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        id: data.message_id || Date.now().toString(),
        sender: "ai",
        text: data.reply,
        timestamp: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }
  } catch (err) {
    console.warn("Backend call failed, using fallback response", err);
  }

  // Graceful fallback if backend is offline
  return new Promise((res) =>
    setTimeout(
      () =>
        res({
          id: Date.now().toString(),
          sender: "ai",
          text: `[Offline Mode] Received: "${message}". Connect to live backend on port 5000 for AI answers.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }),
      1000
    )
  );
};
