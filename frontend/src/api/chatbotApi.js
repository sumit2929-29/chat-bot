const mockConfig = { mode: "CUSTOM_QUESTIONS", assistantName: "Nexus AI", unlockChatAfter: 1 };
const mockQuestions = [
  { id: 1, text: "How does the pricing work?", answer: "We offer flexible tiers starting at $9/mo." },
  { id: 2, text: "Can I embed this on WordPress?", answer: "Yes! We provide a simple JS snippet." }
];

export const fetchChatbotConfig = async () => new Promise((res) => setTimeout(() => res(mockConfig), 500));
export const fetchPredefinedQuestions = async () => new Promise((res) => setTimeout(() => res(mockQuestions), 600));
export const sendMessage = async (message) => new Promise((res) => 
  setTimeout(() => res({ id: Date.now(), sender: 'ai', text: `Simulated response to: "${message}"` }), 1200)
);