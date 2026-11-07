import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Minimize2, Send, Loader2, Trash2 } from 'lucide-react';
import MessageList from './MessageList';
import QuestionCards from './QuestionCards';
import { sendMessage, fetchPredefinedQuestions } from '../api/chatbotApi';

export default function ChatWindow({ onClose, config }) {
  const [messages, setMessages] = useState([
    { id: 'welcome', sender: 'ai', text: `Welcome to ${config.assistantName}. How can I assist you today?`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  
  const isUnlocked = config.mode === 'AI_CHAT_ONLY' || questionsAnswered >= config.unlockChatAfter;

  useEffect(() => {
    if (config.mode === 'CUSTOM_QUESTIONS') {
      fetchPredefinedQuestions().then(setQuestions);
    }
  }, [config.mode]);

  const handleSend = async (textOverride) => {
    const text = textOverride || input;
    if (!text.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text, timestamp: time }]);
    setInput('');
    setIsTyping(true);

    if (textOverride) setQuestionsAnswered(prev => prev + 1);

    const reply = await sendMessage(text, 'session-id');
    setIsTyping(false);
    setMessages(prev => [...prev, reply]);
  };

  const clearChat = () => setMessages([messages[0]]);

  return (
    <motion.div
      initial={{ clipPath: 'circle(0% at 100% 100%)', opacity: 0 }}
      animate={{ clipPath: 'circle(200% at 100% 100%)', opacity: 1 }}
      exit={{ clipPath: 'circle(0% at 100% 100%)', opacity: 0 }}
      transition={{ type: "spring", stiffness: 40, damping: 15 }}
      className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full h-full sm:w-[420px] sm:h-[720px] bg-slate-900/80 backdrop-blur-2xl sm:rounded-3xl border-0 sm:border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-white/5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center border border-white/20 shadow-lg">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          </div>
          <div>
            <h3 className="text-white font-semibold tracking-wide">{config.assistantName}</h3>
            <p className="text-green-400 text-xs font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
            </p>
          </div>
        </div>
        <div className="flex gap-3 text-gray-400">
          <button onClick={clearChat} title="Clear Chat" className="hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
          <button onClick={onClose} className="hover:text-white transition-colors sm:hidden"><Minimize2 className="w-4 h-4" /></button>
          <button onClick={onClose} className="hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 scroll-smooth custom-scrollbar flex flex-col gap-4">
        <MessageList messages={messages} isTyping={isTyping} />
        
        {!isUnlocked && questions.length > 0 && (
          <QuestionCards questions={questions} onSelect={handleSend} />
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/10 shrink-0 relative">
        {!isUnlocked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-xs text-cyan-200 z-10 font-medium">
            Select a quick question to unlock chat
          </motion.div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={!isUnlocked || isTyping}
            className="w-full bg-black/40 border border-white/10 rounded-full pl-5 pr-14 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || !isUnlocked || isTyping}
            className="absolute right-1.5 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
      </div>
    </motion.div>
  );
}