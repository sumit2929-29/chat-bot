"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function QuestionCards({ questions, onSelect }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
      className="flex flex-col gap-2.5 mt-2"
    >
      <p className="text-xs text-gray-400 font-medium mb-1 px-1">Frequently Asked</p>
      {questions.map((q, i) => (
        <motion.button
          key={q.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 + 0.5, type: 'spring' }}
          onClick={() => onSelect(q.text)}
          className="group flex items-center justify-between text-left p-3.5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/15 hover:border-cyan-500/40 text-cyan-100 text-sm transition-all duration-300"
        >
          <span>{q.text}</span>
          <ChevronRight className="w-4 h-4 text-cyan-500/50 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
        </motion.button>
      ))}
    </motion.div>
  );
}