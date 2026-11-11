import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function OrbLauncher({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center justify-center z-50">
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            className="absolute -top-12 bg-black/80 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full whitespace-nowrap shadow-xl border border-white/10 pointer-events-none"
          >
            Ask AI Assistant
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breathing Outer Glow */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-cyan-400 blur-2xl opacity-40 mix-blend-screen"
        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
      />

      {/* The Morphing Orb (Notice the layoutId) */}
      <motion.div 
        layoutId="chatbot-widget"
        className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.5)] flex items-center justify-center border border-white/30 backdrop-blur-lg overflow-hidden cursor-pointer"
        onClick={onClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <motion.div 
          initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Sparkles className="text-white w-7 h-7 relative z-10" />
        </motion.div>
      </motion.div>
    </div>
  );
}