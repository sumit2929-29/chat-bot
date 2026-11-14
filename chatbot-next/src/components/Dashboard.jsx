"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, CheckSquare, Square } from 'lucide-react';
import { fetchChatbotConfig, fetchPredefinedQuestions, saveAdminConfig } from '../api/chatbotApi';

export default function Dashboard({ onNavigateToPreview }) {
  const [config, setConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchChatbotConfig(), fetchPredefinedQuestions()]).then(([conf, q]) => {
      setConfig(conf);
      setQuestions(q);
    });
  }, []);

  const handleAddQuestion = () => setQuestions([...questions, { id: Date.now().toString(), text: '', answer: '' }]);
  const handleRemoveQuestion = (id) => setQuestions(questions.filter(q => q.id !== id));
  const handleQuestionChange = (id, field, value) => setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));

  const handleSave = async () => {
    setIsSaving(true);
    await saveAdminConfig(config, questions);
    setIsSaving(false);
    onNavigateToPreview();
  };

  if (!config) return <div className="text-slate-900 p-10 flex items-center gap-2"><Loader2 className="animate-spin" /> Loading Dashboard...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 w-full pb-20">
      <h2 className="text-3xl font-extrabold text-slate-900 mb-8">Chatbot Configuration</h2>
      
      {/* General Settings - Light Theme */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg text-slate-900 font-bold mb-4">General Settings</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
          <input type="text" value={config.assistantName} onChange={(e) => setConfig({...config, assistantName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-slate-900 focus:border-[#b5db5e] focus:ring-1 focus:ring-[#b5db5e] focus:outline-none transition-colors" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Chat Mode</label>
          <select value={config.mode} onChange={(e) => setConfig({...config, mode: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-slate-900 focus:border-[#b5db5e] focus:ring-1 focus:ring-[#b5db5e] focus:outline-none transition-colors">
            <option value="CUSTOM_QUESTIONS">Mode A: Require Fixed Questions First</option>
            <option value="AI_CHAT_ONLY">Mode B: Open AI Chat Immediately</option>
          </select>
        </div>
      </div>

      {/* Lead Generation Settings - Light Theme */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg text-slate-900 font-bold mb-2">Lead Generation</h3>
        <p className="text-sm text-gray-500 mb-5">Require visitors to provide their contact information before using the chatbot.</p>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-slate-900 font-medium cursor-pointer hover:bg-gray-50 p-2 -ml-2 rounded-lg transition-colors">
            <input type="checkbox" checked={config.requireLeadCapture} onChange={(e) => setConfig({...config, requireLeadCapture: e.target.checked})} className="hidden" />
            {config.requireLeadCapture ? <CheckSquare className="text-[#96be34]" /> : <Square className="text-gray-300" />}
            Enable Pre-Chat Lead Form
          </label>

          {config.requireLeadCapture && (
            <div className="ml-7 space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={config.askEmail} onChange={(e) => setConfig({...config, askEmail: e.target.checked})} className="hidden" />
                {config.askEmail ? <CheckSquare className="text-[#96be34] w-4 h-4" /> : <Square className="text-gray-300 w-4 h-4" />}
                Ask for Email Address
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={config.askPhone} onChange={(e) => setConfig({...config, askPhone: e.target.checked})} className="hidden" />
                {config.askPhone ? <CheckSquare className="text-[#96be34] w-4 h-4" /> : <Square className="text-gray-300 w-4 h-4" />}
                Ask for Phone Number
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Questions - Light Theme */}
      {config.mode === 'CUSTOM_QUESTIONS' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg text-slate-900 font-bold">Fixed Questions</h3>
            <button onClick={handleAddQuestion} className="flex items-center gap-1 bg-[#c8f169]/20 text-slate-800 font-medium px-3 py-1.5 rounded-lg hover:bg-[#c8f169]/40 transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>
          {questions.length === 0 && <p className="text-gray-500 text-sm italic">No questions added yet.</p>}
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative group">
                <button onClick={() => handleRemoveQuestion(q.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                <div className="mb-3 pr-8">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Question {index + 1}</label>
                  <input type="text" value={q.text} placeholder="e.g., How much does it cost?" onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:border-[#b5db5e] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Canned Answer (Optional)</label>
                  <input type="text" value={q.answer} placeholder="e.g., Prices start at $9/mo." onChange={(e) => handleQuestionChange(q.id, 'answer', e.target.value)} className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:border-[#b5db5e] focus:outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-[#c8f169] text-slate-900 px-8 py-3.5 rounded-xl font-bold hover:bg-[#b5db5e] transition-colors disabled:opacity-50 shadow-sm">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save & Preview
        </button>
      </div>
    </div>
  );
}