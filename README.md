# AI-Powered Client Support Chatbot

An enterprise-ready, AI-powered customer support chatbot built with **Next.js**, **Node.js Express**, **Supabase PostgreSQL (RLS)**, and **Dify AI Workflow (Google Gemini)**.

---

## 📁 Repository Structure

```
├── backend/                  # ⚙️ Node.js + Express.js REST API (TypeScript)
│   ├── src/                  # Controllers, Services, Middlewares, Routes
│   ├── supabase/migrations/  # PostgreSQL Schema, RLS Policies, Rate Limiting RPC
│   ├── .env.example          # Environment variables template
│   └── package.json          # Express dependencies
│
├── frontend/                 # 🎨 Next.js + React + Tailwind CSS Frontend
│   ├── src/components/       # ChatbotWidget, ChatWindow, MessageList
│   ├── src/api/chatbotApi.js # API client communicating with backend
│   └── package.json          # Next.js dependencies
│
├── docs/                     # 📚 Official Architecture & Planning Docs
│   ├── 01-PRD.md             # Product Requirements Document
│   ├── 02-TRD.md             # Technical Requirements Document
│   ├── 03-WEB-FLOW.md        # User Navigation & State Logic
│   ├── 04-UI-UX-DESIGN.md    # Design Tokens & Guidelines
│   ├── 05-BACKEND-SCHEMA.md  # Database Schema & Security
│   └── 06-IMPLEMENTATION.md  # Step-by-Step Delivery Plan
│
├── GIT_TEAM_WORKFLOW_GUIDE.md# 🤝 Team Git & GitHub Collaboration Guide
└── README.md                 # This overview file
```

---

## 🚀 Quick Start

### 1. Run Backend Server (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 2. Run Frontend Website (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

---

## 🤝 Team Workflow & Git Instructions
Please read **[GIT_TEAM_WORKFLOW_GUIDE.md](GIT_TEAM_WORKFLOW_GUIDE.md)** before committing or pushing changes to GitHub.
