"use client";

import React, { useState, useEffect } from 'react';
import { Bot, ArrowRight, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useUser, useClerk, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#F1F7EF]/90 border-b border-[#E5F0E1]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-[#254B35] flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-sm">
              <Bot className="w-6 h-6 text-[#A8C99B]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#254B35]">SupportAI</span>
              <span className="text-[10px] uppercase tracking-wider text-[#647267] font-semibold -mt-1">
                SaaS Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-[#254B35] transition-colors">
              Home
            </Link>
            <a href="/#features" className="text-sm font-medium text-[#647267] hover:text-[#254B35] transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="text-sm font-medium text-[#647267] hover:text-[#254B35] transition-colors">
              How It Works
            </a>
            {mounted && isLoaded && isSignedIn && (
              <Link href="/dashboard" className="text-sm font-semibold text-[#254B35] hover:underline transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4 text-[#254B35]" />
                Dashboard
              </Link>
            )}
          </div>

          {/* CTA Actions */}
          <div className="flex items-center gap-3">
            {!mounted || !isLoaded ? (
              // Subtle placeholder while Clerk auth state initializes
              <div className="flex items-center gap-2">
                <div className="h-9 w-20 bg-[#254B35]/5 animate-pulse rounded-full" />
                <div className="h-9 w-28 bg-[#254B35]/10 animate-pulse rounded-full" />
              </div>
            ) : isSignedIn ? (
              // Logged In: Dashboard button + Logout button + Official Clerk User Avatar
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#254B35] hover:bg-[#1c3a29] rounded-full transition-all duration-300 shadow-sm hover:shadow"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#A8C99B]" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#647267] hover:text-red-600 hover:bg-red-50 rounded-full transition-all border border-[#CBD5E1]"
                  title="Sign out of your account"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>

                <div className="border-l border-[#E5F0E1] pl-3 flex items-center">
                  <UserButton />
                </div>
              </div>
            ) : (
              // Logged Out: Login + Get Started
              <>
                <Link
                  href="/sign-in"
                  className="px-5 py-2 text-sm font-medium text-[#254B35] hover:text-[#183223] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#254B35] hover:bg-[#1c3a29] rounded-full transition-all duration-300 shadow-sm hover:shadow"
                >
                  Get Started <ArrowRight className="w-4 h-4 text-[#A8C99B]" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
