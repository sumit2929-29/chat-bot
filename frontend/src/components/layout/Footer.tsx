"use client";

import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  // 1. Create a state for the year (starts empty during server render)
  const [year, setYear] = useState("");

  // 2. Set the year only once it reaches the browser
  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="bg-[#202820] pt-20 pb-10 text-[#E5F0E1]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Bot className="w-8 h-8 text-[#A8C99B]" />
              <span className="text-2xl font-semibold text-white tracking-tight">SupportAI</span>
            </div>
            <p className="text-[#A8C99B] text-sm max-w-sm leading-relaxed mb-6 opacity-80">
              A project by Curious Rabit AI Solutions. Helping businesses automate customer conversations with custom intelligent chatbots.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">Explore</h4>
            <ul className="space-y-4 text-sm opacity-80">
              <li><Link href="#about" className="hover:text-[#A8C99B] transition-colors">About Curious Rabit</Link></li>
              <li><Link href="#our-project" className="hover:text-[#A8C99B] transition-colors">SupportAI project</Link></li>
              <li><Link href="#solutions" className="hover:text-[#A8C99B] transition-colors">Solutions</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">Connect</h4>
            <ul className="space-y-4 text-sm opacity-80">
              <li><Link href="/login" className="hover:text-[#A8C99B] transition-colors">Login</Link></li>
              <li><Link href="#contact" className="hover:text-[#A8C99B] transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#647267]/30 pt-8 flex flex-col md:flex-row items-center justify-between text-xs opacity-60">
          {/* 3. Render the state variable instead of new Date() directly */}
          <p>&copy; {year} SupportAI. A Curious Rabit Project.</p>
          <p className="mt-4 md:mt-0">Built for intelligent business support.</p>
        </div>
      </div>
    </footer>
  );
}