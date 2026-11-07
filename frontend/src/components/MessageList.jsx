import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageList({ messages, isTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[85%] p-3.5 text-[15px] leading-relaxed shadow-md ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl rounded-br-sm' 
                : 'bg-white/10 text-gray-100 rounded-2xl rounded-bl-sm border border-white/5'
            }`}>
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {isTyping && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
          className="flex justify-start"
        >
          <div className="bg-white/10 border border-white/5 py-3.5 px-4 rounded-2xl rounded-bl-sm flex gap-1.5 items-center shadow-md">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
          </div>
        </motion.div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}