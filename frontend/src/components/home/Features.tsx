import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function Features() {
  return (
    <section id="our-project" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold text-[#202820] mb-6">
            Meet SupportAI – Your Business's Intelligent Support Assistant.
          </h2>
          <p className="text-lg text-[#647267] leading-relaxed">
            SupportAI transforms traditional customer support into an intelligent and automated experience. Businesses can configure their own chatbot, provide business-specific knowledge, and integrate it into their websites with a simple embed script.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "AI-Powered Customer Conversations",
              "Custom Business Knowledge Base",
              "Website Chatbot Integration",
              "Automated Customer Assistance",
              "Business-Specific Responses",
              "Easy Chatbot Configuration"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-[#F1F7EF] border border-[#E5F0E1] hover:shadow-md transition-shadow">
                <CheckCircle className="w-6 h-6 text-[#A8C99B] shrink-0" />
                <span className="font-medium text-[#202820] text-sm leading-tight">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="relative p-2 bg-[#F1F7EF] rounded-3xl border border-[#E5F0E1]">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5F0E1] overflow-hidden">
              <div className="border-b border-[#E5F0E1] p-4 flex gap-4 text-sm font-medium text-[#647267]">
                <span className="text-[#254B35] border-b-2 border-[#254B35] pb-4 -mb-4">Knowledge Base</span>
                <span>Chatbot Settings</span>
                <span>Embed Code</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="h-4 w-1/3 bg-[#E5F0E1] rounded"></div>
                <div className="h-24 w-full bg-[#F1F7EF] rounded-xl border border-dashed border-[#A8C99B] flex items-center justify-center">
                  <span className="text-[#A8C99B] text-sm">Upload Business FAQs & Policies</span>
                </div>
                <div className="flex gap-4 pt-4">
                  <div className="h-10 w-24 bg-[#254B35] rounded-full"></div>
                  <div className="h-10 w-24 bg-[#F1F7EF] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}