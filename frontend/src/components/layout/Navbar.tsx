import React from 'react';
import { Bot } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#F1F7EF]/90 border-b border-[#E5F0E1]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Bot className="w-8 h-8 text-[#254B35]" />
            <span className="text-2xl font-semibold tracking-tight text-[#254B35]">SupportAI</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'About', 'Solutions', 'Our Project'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-[#647267] hover:text-[#254B35] transition-colors"
              >
                {item}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="px-6 py-2.5 text-sm font-medium text-[#254B35] border border-[#A8C99B] rounded-full hover:bg-[#E5F0E1] transition-all duration-300"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
