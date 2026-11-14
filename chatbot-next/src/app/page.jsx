"use client";

import React, { useState } from 'react';
import ChatbotWidget from '../components/ChatbotWidget';
import Dashboard from '../components/Dashboard';
import { LayoutDashboard, MonitorPlay } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState('preview'); 
  const [previewKey, setPreviewKey] = useState(0);

  const navigateToPreview = () => {
    setPreviewKey(prev => prev + 1);
    setView('preview');
  };

  return (
    /* 1. Global Background applied here to the root div */
    <div className="min-h-screen bg-[#f4f6ec] flex flex-col font-sans">
      
      {/* 2. Light Theme Navigation */}
      <nav className="bg-white border-b border-gray-200 p-4 flex justify-center gap-4 sticky top-0 z-[9998]">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${view === 'dashboard' ? 'bg-[#c8f169] text-slate-900' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
        </button>
        <button 
          onClick={navigateToPreview}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${view === 'preview' ? 'bg-[#c8f169] text-slate-900' : 'text-gray-600 hover:text-slate-900 hover:bg-gray-100'}`}
        >
          <MonitorPlay className="w-4 h-4" /> Live Website Preview
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-y-auto">
        {view === 'dashboard' ? (
          
          <div className="w-full">
            <Dashboard onNavigateToPreview={navigateToPreview} />
          </div>

        ) : (
          
          <div className="w-full min-h-full relative flex flex-col items-center pt-24 px-4">
            {/* Top Badge */}
            <div className="bg-white px-4 py-1.5 rounded-full shadow-sm text-xs font-medium text-gray-700 mb-8 border border-gray-200 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#c8f169]"></div>
              Curious Rabit AI Solutions Platform
            </div>

            {/* Hero Headlines */}
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#1a202c] text-center max-w-4xl tracking-tight leading-tight mb-6">
              Practical AI Solutions for <br className="hidden md:block" /> Real-World Business <br className="hidden md:block" /> Impact
            </h1>
            <p className="text-gray-600 text-center max-w-2xl text-lg mb-10 leading-relaxed">
              Curious Rabit is an AI solutions company engineering focused, high-leverage products. We bridge the gap between cutting-edge foundation models and day-to-day business operations.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-24">
              <button className="bg-[#c8f169] text-slate-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-[#b5db5e] transition-colors flex items-center justify-center gap-2 shadow-sm">
                Explore Solutions <span>→</span>
              </button>
              <button className="bg-white border border-gray-200 text-slate-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-1">
                Discover GrowUp <span className="text-gray-400 text-sm ml-1">Review AI</span>
              </button>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full px-4 pb-32">
              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1">Zero-Friction UX</h3>
                <p className="text-gray-500 text-xs">No apps or complex onboarding</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1">Targeted AI Models</h3>
                <p className="text-gray-500 text-xs">Optimized prompt engineering</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1">Scalable Cloud Infra</h3>
                <p className="text-gray-500 text-xs">Supabase & edge execution</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1">Measurable ROI</h3>
                <p className="text-gray-500 text-xs">Direct growth and feedback</p>
              </div>
            </div>

            <ChatbotWidget key={previewKey} />
          </div>
        )}
      </div>
    </div>
  );
}