import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function OrbLauncher({ onClick }) {
  // Generate random particles
  const particles = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <motion.div 
      className="relative flex items-center justify-center cursor-pointer group z-50"
      initial={{ scale: 0, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
      onClick={onClick}
    >
      {/* Tooltip */}
      <div className="absolute -top-12 bg-black/80 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 whitespace-nowrap shadow-xl border border-white/10 pointer-events-none">
        Ask AI Assistant
      </div>

      {/* Breathing Outer Glow */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-cyan-400 blur-2xl opacity-40 mix-blend-screen"
        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
      />

      {/* Main Glass Orb */}
      <motion.div 
        className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.5)] flex items-center justify-center border border-white/30 backdrop-blur-lg overflow-hidden"
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated Particles inside orb */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 bg-white rounded-full opacity-50"
            style={{ top: p.top, left: p.left }}
            animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
          />
        ))}
        <Sparkles className="text-white w-7 h-7 relative z-10" />
      </motion.div>
    </motion.div>
  );
}