import React from 'react';

export default function CTA() {
  return (
    <section className="py-24 bg-[#254B35] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#A8C99B] opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl lg:text-5xl font-light text-white mb-6 tracking-tight">
          Bring Intelligent Customer Support to Your Website.
        </h2>
        <p className="text-[#E5F0E1] text-lg lg:text-xl mb-10 max-w-2xl mx-auto opacity-90">
          Give your customers faster answers and give your business more time to grow.
        </p>
        <button className="px-10 py-5 bg-white text-[#254B35] rounded-full font-semibold text-lg hover:bg-[#F1F7EF] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          Get Started
        </button>
      </div>
    </section>
  );
}