"use client";

import React, { useState } from "react";
import {
  Database,
  Plus,
  RefreshCw,
  FileText,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<"crawled" | "custom">("crawled");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [docType, setDocType] = useState<"manual_doc" | "faq">("faq");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Sample data
  const [crawledPages] = useState([
    {
      id: "1",
      path: "/",
      title: "Home - SupportAI Official Platform",
      cleanText:
        "SupportAI is an autonomous customer support SaaS platform powered by Google Gemini API. Seamlessly crawls customer websites and generates 1-line script embed chatbots.",
      crawledAt: "2 mins ago",
    },
    {
      id: "2",
      path: "/pricing",
      title: "Pricing & SaaS Plans",
      cleanText:
        "Starter plan: $29/mo with up to 3 websites and 5,000 monthly conversations. Pro plan: $79/mo with unlimited websites, custom branding, and priority Gemini models.",
      crawledAt: "2 mins ago",
    },
    {
      id: "3",
      path: "/faq",
      title: "Frequently Asked Questions",
      cleanText:
        "Q: Can I embed SupportAI on WordPress? A: Yes, simply paste the script tag into your header or footer. Q: How does Gemini grounding work? A: Answers are generated strictly from your indexed website pages.",
      crawledAt: "2 mins ago",
    },
    {
      id: "4",
      path: "/contact",
      title: "Contact & Enterprise Support",
      cleanText:
        "Reach out to our engineering support team at support@supportai.example.com or via live chat. SLA response time under 15 minutes.",
      crawledAt: "2 mins ago",
    },
  ]);

  const [customDocs, setCustomDocs] = useState([
    {
      id: "c1",
      title: "Return & Refund Policy (Internal FAQ)",
      type: "faq",
      content:
        "Customers can request a 100% refund within 14 days of purchase with no questions asked. Email billing@supportai.example.com to initiate refund processing.",
      created: "Today",
    },
    {
      id: "c2",
      title: "Support Operating Hours & SLA",
      type: "manual_doc",
      content:
        "Our human escalation team is available Monday to Friday from 9 AM to 6 PM EST. AI Chatbot is available 24/7/365 with zero downtime.",
      created: "Yesterday",
    },
  ]);

  function handleAddKnowledge(e: React.FormEvent) {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setCustomDocs([
        ...customDocs,
        {
          id: `c_${Date.now()}`,
          title: docTitle.trim(),
          type: docType,
          content: docContent.trim(),
          created: "Just now",
        },
      ]);
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      setDocTitle("");
      setDocContent("");
      setStatusMsg("Knowledge chunk added and indexed successfully into Supabase vector store!");
      setTimeout(() => setStatusMsg(null), 4000);
    }, 600);
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5F0E1] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#202820]">Website Knowledge Base</h2>
          <p className="text-sm text-[#647267] mt-1">
            All AI responses are strictly grounded on these documents using Supabase full-text search.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setStatusMsg("Re-crawling website in background...");
              setTimeout(() => setStatusMsg("Website re-crawled! 4 pages refreshed."), 2000);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#202820] rounded-full text-sm font-semibold hover:bg-[#F8FAF7] transition-all"
          >
            <RefreshCw className="w-4 h-4 text-[#254B35]" /> Re-crawl Website
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#254B35] text-white rounded-full text-sm font-semibold hover:bg-[#1E3D2B] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add FAQ / Document
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A8C99B] text-sm text-[#2E7D32] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5F0E1] pb-3">
        <button
          onClick={() => setActiveTab("crawled")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "crawled"
              ? "bg-[#254B35] text-white shadow-sm"
              : "text-[#647267] hover:bg-white"
          }`}
        >
          <FileText className="w-4 h-4" /> Crawled Pages ({crawledPages.length})
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "custom"
              ? "bg-[#254B35] text-white shadow-sm"
              : "text-[#647267] hover:bg-white"
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Custom FAQs & Docs ({customDocs.length})
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {activeTab === "crawled" ? (
          crawledPages.map((page) => (
            <div
              key={page.id}
              className="bg-white p-6 rounded-2xl border border-[#E5F0E1] shadow-sm hover:border-[#A8C99B] transition-all"
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#F1F7EF] text-[#254B35] font-semibold">
                    {page.path}
                  </span>
                  <h4 className="font-bold text-[#202820] text-base">{page.title}</h4>
                </div>
                <span className="text-xs text-[#647267] flex-shrink-0">Indexed {page.crawledAt}</span>
              </div>
              <p className="text-sm text-[#647267] leading-relaxed line-clamp-3 bg-[#F8FAF7] p-3 rounded-xl border border-[#F1F7EF]">
                {page.cleanText}
              </p>
            </div>
          ))
        ) : (
          customDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-6 rounded-2xl border border-[#E5F0E1] shadow-sm hover:border-[#A8C99B] transition-all"
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E5F0E1] text-[#254B35] font-semibold uppercase">
                    {doc.type}
                  </span>
                  <h4 className="font-bold text-[#202820] text-base">{doc.title}</h4>
                </div>
                <span className="text-xs text-[#647267] flex-shrink-0">Added {doc.created}</span>
              </div>
              <p className="text-sm text-[#647267] leading-relaxed bg-[#F8FAF7] p-3 rounded-xl border border-[#F1F7EF]">
                {doc.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Custom FAQ Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-[#E5F0E1] relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-[#202820] mb-2">Add FAQ / Policy Document</h3>
            <p className="text-sm text-[#647267] mb-6">
              Give your AI chatbot extra context that might not be on public pages.
            </p>

            <form onSubmit={handleAddKnowledge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#647267] uppercase mb-1.5">
                  Document Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-[#202820] cursor-pointer">
                    <input
                      type="radio"
                      name="docType"
                      checked={docType === "faq"}
                      onChange={() => setDocType("faq")}
                    />
                    FAQ (Question & Answer)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#202820] cursor-pointer">
                    <input
                      type="radio"
                      name="docType"
                      checked={docType === "manual_doc"}
                      onChange={() => setDocType("manual_doc")}
                    />
                    Policy / Article
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#647267] uppercase mb-1.5">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Return Policy, Pricing FAQ"
                  className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#254B35] text-sm text-[#202820]"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#647267] uppercase mb-1.5">
                  Content / Answer *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide detailed facts and policies..."
                  className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#254B35] text-sm text-[#202820]"
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#CBD5E1] text-sm font-semibold text-[#647267] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#254B35] text-white text-sm font-semibold hover:bg-[#1E3D2B] transition-all shadow"
                >
                  {isSubmitting ? "Saving..." : "Save to Knowledge Base"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
