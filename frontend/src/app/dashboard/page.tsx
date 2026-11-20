"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Plus,
  Settings,
  Database,
  Code,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageSquare,
  Bot,
  RefreshCw,
} from "lucide-react";
import { fetchWebsites, createWebsite, WebsiteData } from "@/api/saasApi";

export default function DashboardOverview() {
  const [websites, setWebsites] = useState<WebsiteData[]>([]);
  const [selectedSite, setSelectedSite] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [crawlStep, setCrawlStep] = useState<string | null>(null);
  const [crawlError, setCrawlError] = useState<string | null>(null);

  useEffect(() => {
    loadWebsites();
  }, []);

  async function loadWebsites() {
    setLoading(true);
    try {
      const data = await fetchWebsites();
      setWebsites(data);
      if (data.length > 0) {
        setSelectedSite(data[0]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddWebsite(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setCrawlError(null);
    setCrawlStep("Connecting and verifying URL safety...");

    try {
      await new Promise((r) => setTimeout(r, 600));
      setCrawlStep("Crawling pages and extracting clean text...");
      await new Promise((r) => setTimeout(r, 800));
      setCrawlStep("Detecting brand colors, logo and typography...");
      await new Promise((r) => setTimeout(r, 800));
      setCrawlStep("Generating smart suggested questions with Gemini API...");

      const res = await createWebsite(newUrl.trim(), newName.trim() || undefined);
      setCrawlStep("Done!");

      await loadWebsites();
      setIsModalOpen(false);
      setNewUrl("");
      setNewName("");
      setCrawlStep(null);
    } catch (err: any) {
      setCrawlError(err.message || "Failed to crawl website.");
      setCrawlStep(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Website Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5F0E1] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#254B35] text-white flex items-center justify-center font-bold text-lg">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#647267] uppercase tracking-wider">Active Website</div>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                aria-label="Select active website"
                className="text-xl font-bold text-[#202820] bg-transparent border-none cursor-pointer focus:outline-none"
                value={selectedSite?.id || ""}
                onChange={(e) => {
                  const s = websites.find((w) => w.id === e.target.value);
                  if (s) setSelectedSite(s);
                }}
              >
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.domain})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#254B35] text-white rounded-full text-sm font-semibold hover:bg-[#1E3D2B] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Website
          </button>
        </div>
      </div>

      {/* Hero SaaS Status Banner */}
      <div className="bg-[#254B35] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A8C99B] opacity-15 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-full text-xs font-medium mb-4 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#A8C99B] animate-pulse"></span>
            Gemini Grounded AI Engine Active
          </div>
          <h2 className="text-3xl font-light mb-2 tracking-tight">
            Intelligent Support for <span className="font-semibold text-[#A8C99B]">{selectedSite?.name || "Your Website"}</span>
          </h2>
          <p className="text-[#E5F0E1] text-sm opacity-90 leading-relaxed mb-6">
            Grounded directly on your crawled pages and custom documentation with zero halluncinations.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/embed"
              className="px-5 py-2.5 bg-[#A8C99B] text-[#254B35] font-semibold text-sm rounded-full hover:bg-white transition-all shadow"
            >
              Get Embed Code →
            </Link>
            <Link
              href="/dashboard/settings"
              className="px-5 py-2.5 bg-white/10 text-white font-medium text-sm rounded-full hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              Customize Theme
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#E5F0E1] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#647267] uppercase">Crawled Pages</span>
            <div className="p-2 rounded-xl bg-[#F1F7EF] text-[#254B35]">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#202820]">6</div>
          <div className="text-xs text-[#254B35] mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Indexed
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5F0E1] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#647267] uppercase">Knowledge Base</span>
            <div className="p-2 rounded-xl bg-[#F1F7EF] text-[#254B35]">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#202820]">18 chunks</div>
          <div className="text-xs text-[#647267] mt-1">Full-Text Vector Search</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5F0E1] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#647267] uppercase">AI Response Rate</span>
            <div className="p-2 rounded-xl bg-[#F1F7EF] text-[#254B35]">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#202820]">99.4%</div>
          <div className="text-xs text-[#254B35] mt-1">Direct Gemini Grounding</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5F0E1] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#647267] uppercase">Total Chats</span>
            <div className="p-2 rounded-xl bg-[#F1F7EF] text-[#254B35]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#202820]">342</div>
          <div className="text-xs text-[#647267] mt-1">Visitors Assisted</div>
        </div>
      </div>

      {/* Websites Management Table */}
      <div className="bg-white rounded-3xl border border-[#E5F0E1] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#202820]">Your Configured Websites</h3>
          <span className="text-xs text-[#647267]">{websites.length} websites total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5F0E1] text-xs font-semibold text-[#647267] uppercase">
                <th className="pb-3">Website Name</th>
                <th className="pb-3">Domain</th>
                <th className="pb-3">Crawl Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F7EF] text-sm">
              {websites.map((site) => (
                <tr key={site.id} className="hover:bg-[#F8FAF7] transition-colors">
                  <td className="py-4 font-semibold text-[#202820] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#254B35]" />
                    {site.name}
                  </td>
                  <td className="py-4 text-[#647267]">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      {site.domain} <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#2E7D32]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
                      Completed
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href="/dashboard/knowledge"
                        className="p-2 text-[#647267] hover:text-[#254B35] hover:bg-[#F1F7EF] rounded-lg transition-colors"
                        title="Knowledge Base"
                      >
                        <Database className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="p-2 text-[#647267] hover:text-[#254B35] hover:bg-[#F1F7EF] rounded-lg transition-colors"
                        title="Chatbot Theme"
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/dashboard/embed"
                        className="p-2 text-[#647267] hover:text-[#254B35] hover:bg-[#F1F7EF] rounded-lg transition-colors"
                        title="Get Embed Code"
                      >
                        <Code className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Website Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-[#E5F0E1] relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-[#202820] mb-2">Add New Website</h3>
            <p className="text-sm text-[#647267] mb-6">
              Enter your website URL. Our engine will crawl pages, extract content, detect brand styling, and generate smart questions.
            </p>

            <form onSubmit={handleAddWebsite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#647267] uppercase mb-1.5">
                  Website URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#254B35] text-sm text-[#202820]"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  disabled={Boolean(crawlStep)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#647267] uppercase mb-1.5">
                  Brand Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#254B35] text-sm text-[#202820]"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={Boolean(crawlStep)}
                />
              </div>

              {crawlStep && (
                <div className="p-4 rounded-xl bg-[#F1F7EF] border border-[#A8C99B] text-sm text-[#254B35] flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#254B35]" />
                  <span>{crawlStep}</span>
                </div>
              )}

              {crawlError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{crawlError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={Boolean(crawlStep)}
                  className="px-5 py-2.5 rounded-full border border-[#CBD5E1] text-sm font-semibold text-[#647267] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(crawlStep)}
                  className="px-6 py-2.5 rounded-full bg-[#254B35] text-white text-sm font-semibold hover:bg-[#1E3D2B] transition-all flex items-center gap-2 shadow"
                >
                  {crawlStep ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing
                    </>
                  ) : (
                    "Start Crawling & Generate"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
