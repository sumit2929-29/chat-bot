"use client";

import React from "react";
import Link from "next/link";
import { 
  Bot, 
  LayoutDashboard, 
  Database, 
  Settings, 
  Code, 
  LogOut,
  Bell,
  ExternalLink
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-[#F1F7EF] flex font-sans text-[#202820]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5F0E1] flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="h-20 flex items-center px-6 border-b border-[#E5F0E1]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-[#254B35]" />
            <span className="text-xl font-semibold tracking-tight text-[#254B35]">SupportAI</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-[#F1F7EF] text-[#254B35] rounded-xl font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>
          <Link href="/dashboard/knowledge" className="flex items-center gap-3 px-4 py-3 text-[#647267] hover:bg-[#F1F7EF] hover:text-[#254B35] rounded-xl font-medium transition-colors">
            <Database className="w-5 h-5" />
            Knowledge Base
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-[#647267] hover:bg-[#F1F7EF] hover:text-[#254B35] rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Chatbot Settings
          </Link>
          <Link href="/dashboard/embed" className="flex items-center gap-3 px-4 py-3 text-[#647267] hover:bg-[#F1F7EF] hover:text-[#254B35] rounded-xl font-medium transition-colors">
            <Code className="w-5 h-5" />
            Embed Code
          </Link>
        </nav>

        <div className="p-4 border-t border-[#E5F0E1] space-y-2">
          <Link
            href="/demo-embed.html"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 w-full bg-[#E8F5E9] text-[#254B35] hover:bg-[#d8edd6] rounded-xl text-xs font-semibold transition-colors"
          >
            <span>Live Bot Simulator</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 w-full text-[#647267] hover:bg-[#ffeaea] hover:text-red-600 rounded-xl font-medium transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flow min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#E5F0E1] flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-[#202820]">Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#647267] hover:bg-[#F1F7EF] rounded-full transition-colors relative" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A8C99B] rounded-full"></span>
            </button>

            {/* Clerk User Button & Profile */}
            <div className="flex items-center gap-3 border-l border-[#E5F0E1] pl-4">
              {isLoaded && user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-[#202820]">
                      {user.fullName || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "User"}
                    </span>
                    <span className="text-[11px] text-[#647267]">
                      {user.primaryEmailAddress?.emailAddress || ""}
                    </span>
                  </div>
                  <UserButton />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#254B35] text-white flex items-center justify-center font-semibold text-xs">
                  SA
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
