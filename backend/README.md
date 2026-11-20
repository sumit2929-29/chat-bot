# AI-Powered Client Support Chatbot - Backend

Backend service built with **Next.js API Routes (TypeScript)**, **Supabase PostgreSQL (RLS)**, and **Dify AI Workflow + Gemini API**.

---

## 📖 Complete Documentation & Explanation
For an in-depth, Hindi/English breakdown of the tasks, architecture, security, and code walkthrough, please read:
👉 **[PROJECT_EXPLANATION.md](PROJECT_EXPLANATION.md)**

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and add your credentials:
```bash
cp .env.example .env.local
```

Required variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin secret key
- `DIFY_API_BASE_URL` - Dify endpoint (e.g. `https://api.dify.ai/v1`)
- `DIFY_API_KEY` - Dify App API Key
- `ALLOWED_ORIGIN` - Frontend origin (e.g. `http://localhost:3000`)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per 60s window (default: 20)

### 3. Apply Database Migration
Execute `supabase/migrations/202611130001_init.sql` inside your Supabase **SQL Editor**.

### 4. Run Development Server
```bash
npm run dev
```

Server will be running at `http://localhost:3000`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check for server, database connection, and Dify status |
| `POST` | `/api/session/start` | Validates email & consent, sets HttpOnly session cookie, returns IDs |
| `POST` | `/api/chat/message` | Verifies session & rate limit, saves message, queries Dify (Gemini), saves reply |
| `GET` | `/api/chat/history` | Retrieves paginated messages for authenticated conversation |

---

## 🔒 Security Highlights
- **Row Level Security (RLS)**: Direct browser access to database tables is revoked.
- **HttpOnly Cookies**: Raw session tokens are never exposed to browser JavaScript, preventing XSS attacks.
- **SHA-256 Hash**: Only hashes of session tokens and client IPs are stored in the database.
- **Atomic Rate Limiter**: Shared PostgreSQL bucket enforces 20 req/min across serverless instances.
- **CORS Protection**: Restricted strictly to `ALLOWED_ORIGIN`.
