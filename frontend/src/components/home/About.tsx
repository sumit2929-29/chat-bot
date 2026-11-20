import React from 'react';
import { Cpu } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-[#E5F0E1]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <Cpu className="w-12 h-12 text-[#254B35] mx-auto mb-8 opacity-80" />
        <h2 className="text-3xl lg:text-4xl font-semibold text-[#254B35] mb-8">
          Curiosity Drives Innovation. Practical AI Makes It Real.
        </h2>
        <p className="text-lg text-[#647267] leading-relaxed mb-12">
          Curious Rabit is an AI solutions company focused on building intelligent, practical products for modern businesses. By combining AI capabilities with real-world business requirements, Curious Rabit aims to make technology more accessible, useful, and impactful.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-medium text-[#202820]">
          <div className="p-4 bg-white/60 rounded-xl border border-white">Practical AI innovation.</div>
          <div className="p-4 bg-white/60 rounded-xl border border-white">Business-focused solutions.</div>
          <div className="p-4 bg-white/60 rounded-xl border border-white">Simple user experiences.</div>
          <div className="p-4 bg-white/60 rounded-xl border border-white">Intelligent automation.</div>
        </div>
      </div>
    </section>
  );
}