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

  if (!config) return <div className="text-white p-10 flex items-center gap-2"><Loader2 className="animate-spin" /> Loading Dashboard...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 w-full pb-20">
      <h2 className="text-3xl font-bold text-white mb-8">Chatbot Configuration</h2>
      
      {/* General Settings */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6 shadow-xl">
        <h3 className="text-xl text-cyan-400 font-semibold mb-4">General Settings</h3>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Bot Name</label>
          <input type="text" value={config.assistantName} onChange={(e) => setConfig({...config, assistantName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none" />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Chat Mode</label>
          <select value={config.mode} onChange={(e) => setConfig({...config, mode: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none">
            <option value="CUSTOM_QUESTIONS">Mode A: Require Fixed Questions First</option>
            <option value="AI_CHAT_ONLY">Mode B: Open AI Chat Immediately</option>
          </select>
        </div>
      </div>

      {/* NEW: Lead Generation Settings */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6 shadow-xl">
        <h3 className="text-xl text-cyan-400 font-semibold mb-4">Lead Generation</h3>
        <p className="text-sm text-gray-400 mb-4">Require visitors to provide their contact information before using the chatbot.</p>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-white cursor-pointer hover:bg-slate-700/50 p-2 rounded-lg transition-colors">
            <input type="checkbox" checked={config.requireLeadCapture} onChange={(e) => setConfig({...config, requireLeadCapture: e.target.checked})} className="hidden" />
            {config.requireLeadCapture ? <CheckSquare className="text-cyan-400" /> : <Square className="text-gray-500" />}
            Enable Pre-Chat Lead Form
          </label>

          {config.requireLeadCapture && (
            <div className="ml-8 space-y-2 p-4 bg-slate-900 rounded-lg border border-slate-700">
              <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={config.askEmail} onChange={(e) => setConfig({...config, askEmail: e.target.checked})} className="hidden" />
                {config.askEmail ? <CheckSquare className="text-cyan-400 w-4 h-4" /> : <Square className="text-gray-500 w-4 h-4" />}
                Ask for Email Address
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={config.askPhone} onChange={(e) => setConfig({...config, askPhone: e.target.checked})} className="hidden" />
                {config.askPhone ? <CheckSquare className="text-cyan-400 w-4 h-4" /> : <Square className="text-gray-500 w-4 h-4" />}
                Ask for Phone Number
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Questions */}
      {config.mode === 'CUSTOM_QUESTIONS' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl text-cyan-400 font-semibold">Fixed Questions</h3>
            <button onClick={handleAddQuestion} className="flex items-center gap-1 bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-lg hover:bg-cyan-500/20 transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>
          {questions.length === 0 && <p className="text-gray-500 text-sm italic">No questions added yet.</p>}
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 relative group">
                <button onClick={() => handleRemoveQuestion(q.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                <div className="mb-3 pr-8">
                  <label className="block text-xs text-gray-500 mb-1">Question {index + 1}</label>
                  <input type="text" value={q.text} placeholder="e.g., How much does it cost?" onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Canned Answer (Optional)</label>
                  <input type="text" value={q.answer} placeholder="e.g., Prices start at $9/mo." onChange={(e) => handleQuestionChange(q.id, 'answer', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all font-medium disabled:opacity-50">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save & Preview
        </button>
      </div>
    </div>
  );
}
