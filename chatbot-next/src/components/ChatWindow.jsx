"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Send, Loader2, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
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
  
  // Lead Capture State & Validation
  const [leadCaptured, setLeadCaptured] = useState(!config.requireLeadCapture);
  const [leadData, setLeadData] = useState({ email: '', phone: '' });
  const [leadError, setLeadError] = useState('');

  // Fail-safe: If Mode A is selected but no questions exist, unlock automatically.
  const isUnlocked = config.mode === 'AI_CHAT_ONLY' || questionsAnswered >= config.unlockChatAfter || (config.mode === 'CUSTOM_QUESTIONS' && questions.length === 0);

  useEffect(() => {
    if (config.mode === 'CUSTOM_QUESTIONS') {
      fetchPredefinedQuestions().then(setQuestions);
    }
  }, [config.mode]);

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    setLeadError(''); // Reset errors

    // 1. Email Validation (Must contain @ and a domain)
    if (config.askEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(leadData.email)) {
        setLeadError('Please enter a valid email address (e.g., name@domain.com).');
        return;
      }
    }

    // 2. Phone Validation (Must be exactly 10 digits)
    if (config.askPhone) {
      // Remove spaces, dashes, and parentheses to count pure digits
      const cleanPhone = leadData.phone.replace(/[-_.\s()]/g, '');
      if (cleanPhone.length !== 10 || !/^\d+$/.test(cleanPhone)) {
        setLeadError('Please enter a valid 10-digit phone number.');
        return;
      }
    }

    // If it passes validation, unlock the chat and hide the form!
    setLeadCaptured(true);
  };

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

  return (
    <motion.div
      layoutId="chatbot-widget"
      className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full h-full sm:w-[420px] sm:h-[720px] bg-slate-900/95 backdrop-blur-3xl sm:rounded-3xl border-0 sm:border border-transparent shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden z-50 origin-bottom-right"
      transition={{ type: "spring", stiffness: 150, damping: 22, mass: 0.8 }}
    >
      {/* Neon Light Effect SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="neon-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" /><stop offset="50%" stopColor="#a855f7" /><stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="blur-glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <motion.rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="24" fill="none" stroke="url(#neon-glow)" strokeWidth="3" filter="url(#blur-glow)" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0] }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} />
        <motion.rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="24" fill="none" stroke="url(#neon-glow)" strokeWidth="1" opacity="0.3" initial={{ pathOffset: 0 }} animate={{ pathOffset: 1 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      </svg>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="flex flex-col h-full w-full relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-white/5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]"><span className="text-white font-bold text-sm">AI</span></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <h3 className="text-white font-semibold">{config.assistantName}</h3>
              <p className="text-green-400 text-xs font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online</p>
            </div>
          </div>
          <div className="flex gap-3 text-gray-400">
            <button onClick={() => setMessages([messages[0]])} title="Clear Chat" className="hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
            <button onClick={onClose} className="hover:text-white transition-colors sm:hidden"><Minimize2 className="w-4 h-4" /></button>
            <button onClick={onClose} className="hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Content Area (Toggles between Form and Chat) */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!leadCaptured ? (
              
              /* STYLISH LEAD CAPTURE FORM WITH VALIDATION */
              <motion.div key="lead-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 p-6 flex flex-col justify-center bg-slate-900/50">
                <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
                  <h4 className="text-cyan-400 font-semibold mb-2 text-lg">Before we begin...</h4>
                  <p className="text-gray-400 text-sm mb-6">Please provide your details so we can assist you better.</p>
                  
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    {config.askEmail && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Email Address</label>
                        <input type="text" required value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-cyan-500 focus:outline-none" placeholder="you@company.com" />
                      </div>
                    )}
                    {config.askPhone && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Phone Number (10 digits)</label>
                        <input type="tel" required value={leadData.phone} onChange={e => setLeadData({...leadData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-cyan-500 focus:outline-none" placeholder="9876543210" />
                      </div>
                    )}

                    {/* Validation Error Message */}
                    {leadError && (
                      <div className="flex items-start gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-xs font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>{leadError}</p>
                      </div>
                    )}

                    <button type="submit" className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                      Start Chat <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </motion.div>

            ) : (

              /* NORMAL CHAT UI */
              <motion.div key="chat-ui" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-5 scroll-smooth custom-scrollbar flex flex-col gap-4">
                  <MessageList messages={messages} isTyping={isTyping} />
                  {!isUnlocked && questions.length > 0 && <QuestionCards questions={questions} onSelect={handleSend} />}
                </div>

                <div className="p-4 bg-white/5 border-t border-white/10 shrink-0 relative">
                  {!isUnlocked && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-xs text-cyan-200 z-10 font-medium">
                      Select a quick question to unlock chat
                    </motion.div>
                  )}
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." disabled={!isUnlocked || isTyping} className="w-full bg-black/40 border border-white/10 rounded-full pl-5 pr-14 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all disabled:opacity-50" />
                    <button type="submit" disabled={!input.trim() || !isUnlocked || isTyping} className="absolute right-1.5 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white disabled:opacity-30 transition-all hover:scale-105 active:scale-95">
                      {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                    </button>
                  </form>
                </div>
              </motion.div>

            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}