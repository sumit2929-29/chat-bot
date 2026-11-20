"use client";

import React, { useState, useEffect } from "react";
import {
  Code,
  Copy,
  Check,
  Globe,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Play,
  Layers,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { fetchWebsites, fetchWebsiteDetails, WebsiteData } from "@/api/saasApi";

export default function EmbedPage() {
  const [websites, setWebsites] = useState<WebsiteData[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [publicChatbotId, setPublicChatbotId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "react" | "wordpress">("html");

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    setLoading(true);
    try {
      const sites = await fetchWebsites();
      setWebsites(sites);
      if (sites.length > 0) {
        const initialId = sites[0].id;
        setSelectedSiteId(initialId);
        await loadConfigForSite(initialId);
      } else {
        setPublicChatbotId("bot_demo12345678");
      }
    } catch {
      setPublicChatbotId("bot_demo12345678");
    } finally {
      setLoading(false);
    }
  }

  async function loadConfigForSite(siteId: string) {
    try {
      const details = await fetchWebsiteDetails(siteId);
      if (details?.chatbotConfig?.public_chatbot_id) {
        setPublicChatbotId(details.chatbotConfig.public_chatbot_id);
      } else {
        setPublicChatbotId(`bot_${siteId.replace(/-/g, "").substring(0, 16)}`);
      }
    } catch {
      setPublicChatbotId(`bot_${siteId.replace(/-/g, "").substring(0, 16)}`);
    }
  }

  async function handleSiteChange(siteId: string) {
    setSelectedSiteId(siteId);
    await loadConfigForSite(siteId);
  }

  const effectiveBotId = publicChatbotId || "bot_demo12345678";
  const embedCode = `<!-- SupportAI Autonomous Chatbot Widget -->
<script
  src="http://localhost:5000/widget.js"
  data-chatbot-id="${effectiveBotId}"
  async
></script>`;

  const reactCode = `// Add to your root layout.tsx or _app.tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="http://localhost:5000/widget.js"
          data-chatbot-id="${effectiveBotId}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`;

  const wpCode = `1. In WordPress Admin, go to Appearance -> Theme File Editor (or use 'WPCode / Insert Headers and Footers' plugin).
2. Open footer.php.
3. Paste the following script tag right before the closing </body> tag:

<script src="http://localhost:5000/widget.js" data-chatbot-id="${effectiveBotId}" async></script>
4. Click 'Update File'. The chatbot will appear instantly on your website!`;

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleOpenLiveDemo() {
    window.open(`/demo-embed.html?bot=${effectiveBotId}`, "_blank");
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5F0E1] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#202820]">Embed Chatbot on Your Website</h2>
          <p className="text-sm text-[#647267] mt-1">
            Generate 100% functional, Shadow DOM encapsulated embed code connected directly to your website&apos;s database.
          </p>
        </div>

        {/* Website Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label htmlFor="website-select" className="text-xs font-semibold text-[#647267] uppercase whitespace-nowrap">
            Website:
          </label>
          <div className="relative">
            <select
              id="website-select"
              value={selectedSiteId}
              onChange={(e) => handleSiteChange(e.target.value)}
              className="appearance-none bg-[#F1F7EF] border border-[#A8C99B] text-[#254B35] font-semibold text-sm py-2 px-4 pr-9 rounded-full focus:outline-none cursor-pointer"
            >
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.domain})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#254B35] absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 1-Line Embed Snippet Box */}
      <div className="bg-[#202820] rounded-3xl p-8 text-white relative shadow-xl overflow-hidden border border-[#254B35]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#A8C99B] uppercase tracking-wider">
            <Code className="w-4 h-4" /> 1-Line Script Embed Tag
            <span className="ml-2 font-mono text-[11px] bg-white/10 px-2 py-0.5 rounded text-white font-normal">
              ID: {effectiveBotId}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenLiveDemo}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#A8C99B] hover:bg-[#8eb87e] text-[#254B35] rounded-full text-xs font-bold transition-all shadow"
              title="Open test website in a new window with this bot loaded"
            >
              <Play className="w-3.5 h-3.5 fill-[#254B35]" /> Test Widget Live
            </button>

            <button
              onClick={() => handleCopy(embedCode)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#254B35] hover:bg-[#1E3D2B] text-white rounded-full text-xs font-semibold transition-all border border-[#A8C99B]/30 shadow"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#A8C99B]" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Embed Code
                </>
              )}
            </button>
          </div>
        </div>

        <pre className="font-mono text-sm text-[#E5F0E1] bg-black/40 p-5 rounded-2xl overflow-x-auto border border-white/10 leading-relaxed">
          {embedCode}
        </pre>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10 text-xs text-[#E5F0E1]/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#A8C99B]" />
            Shadow DOM Encapsulated (No CSS Clashes)
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#A8C99B]" />
            Fast Async &amp; Lazy Loading (~12KB)
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A8C99B]" />
            Direct Gemini Grounding &amp; RAG
          </div>
        </div>
      </div>

      {/* Live Verification Box */}
      <div className="bg-[#E8F5E9] rounded-3xl border border-[#A8C99B] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-[#254B35] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2E7D32]" /> Verify Your Chatbot Right Now
          </h4>
          <p className="text-xs text-[#2E7D32] mt-1">
            Click &quot;Test Widget Live&quot; to open a simulated customer website. The bot will load with your logo, colors, and live Gemini AI answers.
          </p>
        </div>
        <button
          onClick={handleOpenLiveDemo}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#254B35] hover:bg-[#1E3D2B] text-white rounded-full text-xs font-semibold transition-all shadow"
        >
          <ExternalLink className="w-4 h-4" /> Open Live Simulation
        </button>
      </div>

      {/* Platform Instructions */}
      <div className="bg-white rounded-3xl border border-[#E5F0E1] p-8 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-[#202820]">Step-by-Step Installation Guides</h3>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#E5F0E1] pb-3">
          <button
            onClick={() => setActiveTab("html")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "html" ? "bg-[#254B35] text-white" : "text-[#647267] hover:bg-gray-100"
            }`}
          >
            HTML / Static Websites
          </button>
          <button
            onClick={() => setActiveTab("react")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "react" ? "bg-[#254B35] text-white" : "text-[#647267] hover:bg-gray-100"
            }`}
          >
            Next.js / React
          </button>
          <button
            onClick={() => setActiveTab("wordpress")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "wordpress" ? "bg-[#254B35] text-white" : "text-[#647267] hover:bg-gray-100"
            }`}
          >
            WordPress / Shopify / Webflow
          </button>
        </div>

        {activeTab === "html" && (
          <div className="space-y-4">
            <p className="text-sm text-[#647267] leading-relaxed">
              Add the snippet right before the closing <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs text-[#202820]">&lt;/body&gt;</code> tag on any HTML page where you want the chatbot launcher to appear.
            </p>
            <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5F0E1] font-mono text-xs text-[#202820]">
              &lt;!DOCTYPE html&gt;<br />
              &lt;html&gt;<br />
              &nbsp;&nbsp;&lt;body&gt;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&lt;h1&gt;Welcome to My Website&lt;/h1&gt;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&lt;!-- SupportAI Widget --&gt;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&lt;script src=&quot;http://localhost:5000/widget.js&quot; data-chatbot-id=&quot;{effectiveBotId}&quot; async&gt;&lt;/script&gt;<br />
              &nbsp;&nbsp;&lt;/body&gt;<br />
              &lt;/html&gt;
            </div>
          </div>
        )}

        {activeTab === "react" && (
          <div className="space-y-4">
            <p className="text-sm text-[#647267] leading-relaxed">
              Use Next.js <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs text-[#202820]">&lt;Script /&gt;</code> component with strategy lazyOnload for optimal performance.
            </p>
            <pre className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5F0E1] font-mono text-xs text-[#202820] overflow-x-auto">
              {reactCode}
            </pre>
          </div>
        )}

        {activeTab === "wordpress" && (
          <div className="space-y-4">
            <p className="text-sm text-[#647267] leading-relaxed whitespace-pre-line">
              {wpCode}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
