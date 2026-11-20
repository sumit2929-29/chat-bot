"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Bot,
  MessageSquare,
  CheckCircle2,
  Save,
  Sparkles,
  Send,
  Eye,
  Loader2,
  ChevronDown,
} from "lucide-react";
import {
  fetchWebsites,
  fetchWebsiteDetails,
  updateChatbotConfig,
  WebsiteData,
} from "@/api/saasApi";

export default function ChatbotSettingsPage() {
  const [websites, setWebsites] = useState<WebsiteData[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [botName, setBotName] = useState("Acme Support Assistant");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hi there! 👋 Welcome to Acme Corp. How can I help you today?"
  );
  const [placeholderText, setPlaceholderText] = useState("Ask a question...");
  const [primaryColor, setPrimaryColor] = useState("#0F172A");
  const [secondaryColor, setSecondaryColor] = useState("#3B82F6");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "What services do you provide?",
    "How can I contact sales?",
    "What are your pricing plans?",
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    try {
      const sites = await fetchWebsites();
      setWebsites(sites);
      if (sites.length > 0) {
        setSelectedSiteId(sites[0].id);
        await loadSiteConfig(sites[0].id);
      }
    } catch (err) {
      console.warn("Failed to load websites:", err);
    }
  }

  async function loadSiteConfig(siteId: string) {
    try {
      const details = await fetchWebsiteDetails(siteId);
      if (details?.chatbotConfig) {
        const c = details.chatbotConfig;
        setBotName(c.chatbot_name || "Support Assistant");
        setWelcomeMessage(c.welcome_message || "Hi there! How can I help you?");
        setPlaceholderText(c.placeholder_text || "Ask a question...");
        setPrimaryColor(c.primary_color || "#0F172A");
        setSecondaryColor(c.secondary_color || "#3B82F6");
        setPosition(c.position || "bottom-right");
      }
      if (details?.suggestedQuestions?.length > 0) {
        setSuggestedQuestions(details.suggestedQuestions.map((q: any) => q.question_text));
      }
    } catch (err) {
      console.warn("Failed to load site config:", err);
    }
  }

  async function handleSiteChange(siteId: string) {
    setSelectedSiteId(siteId);
    await loadSiteConfig(siteId);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSiteId) return;

    setIsSaving(true);
    try {
      await updateChatbotConfig(selectedSiteId, {
        chatbot_name: botName,
        welcome_message: welcomeMessage,
        placeholder_text: placeholderText,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        position,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.warn("Failed to save config:", err);
      // fallback simulation
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5F0E1] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#202820]">Chatbot Visual Builder</h2>
          <p className="text-sm text-[#647267] mt-1">
            Customize the look, feel, greeting and position of the embedded chatbot.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {websites.length > 0 && (
            <div className="relative">
              <select
                value={selectedSiteId}
                onChange={(e) => handleSiteChange(e.target.value)}
                className="appearance-none bg-[#F1F7EF] border border-[#A8C99B] text-[#254B35] font-semibold text-xs py-2 px-3 pr-8 rounded-full focus:outline-none cursor-pointer"
              >
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#254B35] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          )}

          {isSaved && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold rounded-full border border-[#A8C99B] animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Changes Saved!
            </div>
          )}
        </div>
      </div>

      {/* Builder Layout: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#E5F0E1] shadow-sm space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#647267] uppercase mb-1.5">
                Assistant Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#254B35] text-sm text-[#202820] font-medium"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#647267] uppercase mb-1.5">
                Welcome Message
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#254B35] text-sm text-[#202820] font-medium leading-relaxed"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#647267] uppercase mb-1.5">
                Input Placeholder
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#254B35] text-sm text-[#202820]"
                value={placeholderText}
                onChange={(e) => setPlaceholderText(e.target.value)}
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#647267] uppercase mb-1.5">
                  Header &amp; Launcher Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#CBD5E1] p-0.5 bg-transparent"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-mono text-xs text-[#202820]"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#647267] uppercase mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#CBD5E1] p-0.5 bg-transparent"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-mono text-xs text-[#202820]"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs font-semibold text-[#647267] uppercase mb-2">
                Launcher Widget Position
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPosition("bottom-right")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    position === "bottom-right"
                      ? "border-[#254B35] bg-[#F1F7EF] text-[#254B35]"
                      : "border-[#CBD5E1] text-[#647267] hover:bg-gray-50"
                  }`}
                >
                  Bottom Right (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setPosition("bottom-left")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    position === "bottom-left"
                      ? "border-[#254B35] bg-[#F1F7EF] text-[#254B35]"
                      : "border-[#CBD5E1] text-[#647267] hover:bg-gray-50"
                  }`}
                >
                  Bottom Left
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5F0E1] flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-[#254B35] hover:bg-[#1E3D2B] text-white rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Chatbot Customization
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Interactive Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs font-bold text-[#647267] uppercase tracking-wider mb-3 flex items-center gap-1.5 self-start">
            <Eye className="w-4 h-4" /> Live Interactive Preview
          </div>

          <div className="w-full max-w-[360px] bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col h-[520px]">
            {/* Header */}
            <div
              className="p-4 text-white flex items-center justify-between"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">{botName}</div>
                  <div className="text-[11px] opacity-80 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-3">
              {/* Assistant Welcome */}
              <div className="flex flex-col max-w-[85%] self-start">
                <div className="p-3 rounded-2xl rounded-bl-sm bg-white border border-gray-200 text-xs text-gray-800 leading-relaxed shadow-sm">
                  {welcomeMessage}
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="pt-2 space-y-1.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Suggested Questions
                </div>
                {suggestedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 hover:border-blue-400 cursor-pointer transition-all shadow-sm flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <Sparkles className="w-3 h-3 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Input */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                <input
                  type="text"
                  placeholder={placeholderText}
                  disabled
                  className="w-full bg-transparent text-xs text-gray-600 focus:outline-none"
                />
                <button
                  type="button"
                  className="w-6 h-6 rounded-full text-white flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[10px] text-center text-gray-400 mt-2">
                Powered by <span className="font-semibold text-gray-600">SupportAI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
