import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function OrbLauncher({ onClick }) {
  return (
    <motion.div className="relative flex items-center justify-center cursor-pointer group"
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }} onClick={onClick}>
      <div className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
        Ask AI Assistant
      </div>
      <motion.div className="absolute inset-0 rounded-full bg-blue-500 blur-xl opacity-50"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-purple-500 border border-white/20 shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center"
        whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
        <Sparkles className="text-white w-7 h-7" />
      </motion.div>
    </motion.div>
  );
}