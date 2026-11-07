import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import OrbLauncher from './OrbLauncher';
import ChatWindow from './ChatWindow';
import { fetchChatbotConfig } from '../api/chatbotApi';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => { fetchChatbotConfig().then(setConfig); }, []);
  if (!config) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence mode="wait">
        {!isOpen ? <OrbLauncher key="orb" onClick={() => setIsOpen(true)} /> : <ChatWindow key="window" onClose={() => setIsOpen(false)} config={config} />}
      </AnimatePresence>
    </div>
  );
}