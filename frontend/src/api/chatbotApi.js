const mockConfig = {
  mode: "CUSTOM_QUESTIONS", // "CUSTOM_QUESTIONS" or "AI_CHAT_ONLY"
  assistantName: "Aura",
  theme: "dark",
  unlockChatAfter: 1, // Number of required question clicks before free-text unlocks
};

const mockQuestions = [
  { id: 'q1', text: "How does the platform pricing work?", answer: "Our SaaS tiers start at $29/mo for early stage startups." },
  { id: 'q2', text: "Can I embed this on Webflow?", answer: "Absolutely! We provide a simple `<script>` tag that works on any website builder." },
  { id: 'q3', text: "What AI model powers this?", answer: "We use a fine-tuned LLM optimized for business customer support." }
];

export const fetchChatbotConfig = async () => {
  return new Promise((res) => setTimeout(() => res(mockConfig), 400));
};

export const fetchPredefinedQuestions = async () => {
  return new Promise((res) => setTimeout(() => res(mockQuestions), 500));
};

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