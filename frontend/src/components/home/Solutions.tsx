import React from 'react';
import { MessageSquare, Zap, Database, Globe } from 'lucide-react';

export default function Solutions() {
  return (
    <section id="solutions" className="py-24 bg-[#F1F7EF]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-semibold text-[#202820] mb-16 text-center">
          Intelligent Solutions for Everyday Business Challenges.
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: MessageSquare, title: "Customer Support Automation" },
            { icon: Zap, title: "AI-Powered Business Assistance" },
            { icon: Database, title: "Knowledge-Based Chatbots" },
            { icon: Globe, title: "Website Integration" }
          ].map((solution, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-[#E5F0E1] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#E5F0E1] flex items-center justify-center mb-6">
                <solution.icon className="w-6 h-6 text-[#254B35]" />
              </div>
              <h4 className="text-lg font-semibold text-[#202820] mb-3">{solution.title}</h4>
              <div className="w-8 h-1 bg-[#A8C99B] rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}