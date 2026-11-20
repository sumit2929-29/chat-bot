import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import About from '@/components/home/About';
import Features from '@/components/home/Features';
import Solutions from '@/components/home/Solutions';
import CTA from '@/components/home/CTA';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F1F7EF] font-sans text-[#202820] selection:bg-[#A8C99B] selection:text-[#254B35] relative">
      <Navbar />
      
      <main>
        <Hero />
        <About />
        <Features />
        <Solutions />
        <CTA />
      </main>

      <Footer />

      {/* Floating AI Client Support Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
