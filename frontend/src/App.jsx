import React, { useState } from 'react';
import ChatbotWidget from './components/ChatbotWidget';
import Dashboard from './components/Dashboard';
import { LayoutDashboard, MonitorPlay } from 'lucide-react';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'preview'
  
  // We use this to force the ChatbotWidget to remount and fetch the latest config when we switch to preview
  const [previewKey, setPreviewKey] = useState(0);

  const navigateToPreview = () => {
    setPreviewKey(prev => prev + 1);
    setView('preview');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col font-sans">
      
      {/* SaaS App Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4 flex justify-center gap-4 relative z-[9998]">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${view === 'dashboard' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
        </button>
        <button 
          onClick={navigateToPreview}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${view === 'preview' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}
        >
          <MonitorPlay className="w-4 h-4" /> Live Website Preview
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-y-auto">
        {view === 'dashboard' ? (
          <Dashboard onNavigateToPreview={navigateToPreview} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <h1 className="text-3xl text-gray-400 font-bold mb-4">Client Website Simulation</h1>
            <p className="text-gray-500">Look at the bottom right corner 👇</p>
            
            {/* The widget remounts with the new key, fetching the updated mock config */}
            <ChatbotWidget key={previewKey} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;