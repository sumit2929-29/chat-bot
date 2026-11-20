import React from 'react';
import { Bot, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative pt-24 pb-32 overflow-hidden bg-[#F1F7EF]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-[#E5F0E1] text-[#254B35] text-xs font-bold tracking-widest uppercase mb-6 border border-[#A8C99B]/30">
              Curious Rabit AI Solutions
            </span>
            <h1 className="text-5xl lg:text-6xl font-light text-[#202820] leading-[1.15] tracking-tight mb-6">
              Making AI Practical.<br />
              <span className="font-semibold text-[#254B35]">Making Business Smarter.</span>
            </h1>
            <p className="text-lg text-[#647267] mb-10 leading-relaxed">
              At Curious Rabit, we believe AI should do more than impress. It should solve real problems, simplify everyday workflows, and create meaningful business impact.
            </p>
            
            <div className="p-6 rounded-2xl bg-white border border-[#E5F0E1] shadow-sm mb-10">
              <h3 className="text-xl font-medium text-[#254B35] mb-2">Meet SupportAI – Intelligent Customer Support, Reimagined.</h3>
              <p className="text-[#647267] text-sm leading-relaxed">
                An AI-powered customer support platform that helps businesses automate conversations, answer customer questions, and deliver instant assistance using their own business knowledge.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button className="flex items-center gap-2 px-8 py-4 bg-[#254B35] text-white rounded-full font-medium hover:bg-[#1e3d2a] transition-all duration-300 shadow-lg shadow-[#254B35]/20">
                Explore SupportAI <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-4 bg-white text-[#254B35] rounded-full font-medium border border-[#E5F0E1] hover:bg-[#E5F0E1] transition-all duration-300">
                Get Started
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#A8C99B]/20 to-transparent rounded-3xl transform rotate-3 scale-105"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border border-[#E5F0E1] overflow-hidden flex flex-col h-[500px]">
              <div className="p-5 border-b border-[#E5F0E1] bg-[#F1F7EF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#254B35] flex items-center justify-center text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#202820]">Support Assistant</h4>
                    <p className="text-xs text-[#A8C99B] font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#A8C99B]"></span> Online
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col gap-4 bg-white/50">
                <div className="self-start max-w-[80%] bg-[#F1F7EF] p-4 rounded-2xl rounded-tl-sm text-[#202820] text-sm shadow-sm border border-[#E5F0E1]">
                  Hello! I'm the SupportAI assistant. How can I help you with our business services today?
                </div>
                <div className="self-end max-w-[80%] bg-[#254B35] text-white p-4 rounded-2xl rounded-tr-sm text-sm shadow-md">
                  Can you help me understand your pricing and delivery options?
                </div>
                <div className="self-start max-w-[80%] bg-[#F1F7EF] p-4 rounded-2xl rounded-tl-sm text-[#202820] text-sm shadow-sm border border-[#E5F0E1]">
                  Absolutely. Based on our policies, standard delivery takes 3-5 business days. Our pricing tiers are tailored to business size...
                </div>
              </div>
              <div className="p-4 border-t border-[#E5F0E1] bg-white">
                <div className="relative">
                  <input type="text" placeholder="Type your message..." className="w-full bg-[#F1F7EF] border-none rounded-full py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8C99B]" readOnly />
                  <button className="absolute right-2 top-1.5 p-2 bg-[#254B35] text-white rounded-full">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}