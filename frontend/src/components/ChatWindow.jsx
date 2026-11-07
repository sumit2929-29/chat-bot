import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { sendMessage, fetchPredefinedQuestions } from '../api/chatbotApi';

export default function ChatWindow({ onClose, config }) {
  const [messages, setMessages] = useState([{ id: 1, sender: 'ai', text: `Hi! I'm ${config.assistantName}.` }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [unlocked, setUnlocked] = useState(config.mode === 'AI_CHAT_ONLY');
  const endRef = useRef(null);

  useEffect(() => { fetchPredefinedQuestions().then(setQuestions); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleSend = async (override) => {
    const text = override || input;
    if (!text.trim()) return;
    setMessages(p => [...p, { id: Date.now(), sender: 'user', text }]);
    setInput(''); setIsTyping(true); setUnlocked(true);
    const reply = await sendMessage(text);
    setIsTyping(false); setMessages(p => [...p, reply]);
  };

  return (
    <motion.div initial={{ clipPath: 'circle(0% at 100% 100%)' }} animate={{ clipPath: 'circle(150% at 100% 100%)' }} exit={{ clipPath: 'circle(0% at 100% 100%)' }} transition={{ type: "spring", damping: 20 }}
      className="flex flex-col bg-gray-900 border border-white/10 shadow-2xl rounded-2xl sm:w-[400px] sm:h-[600px] w-[100vw] h-[100vh] sm:bottom-0 sm:right-0 fixed bottom-0 right-0 overflow-hidden z-50">
      
      <div className="flex justify-between items-center p-4 bg-white/5 border-b border-white/10">
        <div className="text-white font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs">AI</div>
          {config.assistantName}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 text-gray-100 rounded-bl-none'}`}>{m.text}</div>
          </div>
        ))}
        {!unlocked && questions.map((q) => (
          <button key={q.id} onClick={() => handleSend(q.text)} className="w-full text-left p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 text-sm mb-2">{q.text}</button>
        ))}
        {isTyping && <div className="text-gray-400 text-sm ml-2">Typing...</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={!unlocked || isTyping} placeholder="Type a message..." className="flex-1 bg-white/5 rounded-full px-4 text-sm text-white focus:outline-none focus:border-blue-500 border border-white/10" />
        <button type="submit" disabled={!input.trim() || !unlocked || isTyping} className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-50"><Send className="w-4 h-4 ml-1" /></button>
      </form>
    </motion.div>
  );
}