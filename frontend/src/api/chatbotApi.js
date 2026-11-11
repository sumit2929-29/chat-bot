// Add lead capture settings to the initial config
let mockConfig = {
  mode: "CUSTOM_QUESTIONS", 
  assistantName: "Aura",
  theme: "dark",
  unlockChatAfter: 1,
  requireLeadCapture: true, // NEW: Does the bot require contact info first?
  askEmail: true,           // NEW: Ask for email?
  askPhone: false,          // NEW: Ask for phone?
};

let mockQuestions = [
  { id: 'q1', text: "How does the platform pricing work?", answer: "Our SaaS tiers start at $29/mo." },
];

export const fetchChatbotConfig = async () => {
  return new Promise((res) => setTimeout(() => res(mockConfig), 400));
};

export const fetchPredefinedQuestions = async () => {
  return new Promise((res) => setTimeout(() => res(mockQuestions), 500));
};

export const saveAdminConfig = async (newConfig, newQuestions) => {
  return new Promise((res) => {
    setTimeout(() => {
      mockConfig = { ...mockConfig, ...newConfig };
      mockQuestions = [...newQuestions];
      res({ success: true });
    }, 500);
  });
};

// ... keep fetchChatHistory and sendMessage below here

export const fetchChatHistory = async (sessionId) => {
  return new Promise((res) => setTimeout(() => res([]), 300));
};

export const sendMessage = async (message, sessionId) => {
  return new Promise((res) => 
    setTimeout(() => res({ 
      id: Date.now().toString(), 
      sender: 'ai', 
      text: `This is a simulated AI response to: "${message}"`, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }), 1500)
  );
};