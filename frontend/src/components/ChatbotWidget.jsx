import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import OrbLauncher from './OrbLauncher';
import ChatWindow from './ChatWindow';
import { fetchChatbotConfig } from '../api/chatbotApi';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetchChatbotConfig().then(setConfig);
  }, []);

  if (!config) return null;

  return (
    // Style wrapper ensures styles don't leak into the host website
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[9999] font-sans antialiased" style={{ isolation: 'isolate' }}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <OrbLauncher key="orb" onClick={() => setIsOpen(true)} />
        ) : (
          <ChatWindow key="window" onClose={() => setIsOpen(false)} config={config} />
        )}
      </AnimatePresence>
    </div>
  );
}