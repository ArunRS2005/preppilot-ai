# PrepPilot AI — Interview Intelligence System

**"Your Personal AI Interview Intelligence System."**

A premium, futuristic AI-powered interview preparation platform that helps students and early-career candidates prepare for technical and behavioral interviews through realistic practice, Gemini-powered evaluation, evidence tracking, and targeted coaching.

---

---

## Table of Contents

1. [What it does](#what-it-does)
2. [Architecture](#architecture)
3. [Quick start (local)](#quick-start-local)
4. [Getting a Gemini API key](#getting-a-gemini-api-key)
5. [Environment variables](#environment-variables)
6. [Running tests](#running-tests)
7. [Deployment](#deployment)
   - [Frontend → Vercel](#frontend--vercel)
   - [Backend → Render](#backend--render)
   - [Database → Supabase](#database--supabase-optional)
8. [Deployment checklist](#deployment-checklist)
9. [Project structure](#project-structure)
10. [Readiness score explained](#readiness-score-explained)
11. [Offline / mock mode](#offline--mock-mode)
12. [Known limits and notes](#known-limits-and-notes)

---

## What it does

PrepPilot AI helps students and early-career candidates prepare for technical and behavioral interviews through:

### Core Features
- **Mock interviews** — 6 topics (Java, DSA, DBMS, OS, Networks, Behavioral), 3 difficulty levels, 48 curated questions
- **Gemini AI evaluation** — scores answers on technical correctness, completeness, and clarity; never just keyword matching
- **Interview Evidence Portfolio** — tracks which concepts you've demonstrated and which need work
- **Transparent readiness score** — formula shown in the UI, never a black box
- **Targeted practice drills** — recommendations driven by your weakest topics and missing concepts
- **Full history** — review every past session, answer, and evaluation

### Signature Intelligence Features
- **Skill DNA Graph** — interactive knowledge graph (React Flow) showing skill dependencies, colored by evidence status derived from real evaluations
- **Answer Evolution Tracker** — side-by-side comparison of your answers to the same question over time
- **Weakness-to-Mastery Roadmap** — personalized learning path generated from missing concepts and weak areas
- **Interview Evidence Passport** — exportable professional report with print/PDF support
- **Interviewer Personalities** — 5 AI interviewer personas (Friendly Mentor, Strict Technical, Senior Engineer, Stress Interviewer, Engineering Manager)

### Engineering Lab
- **Coding challenges** — Monaco code editor, algorithm problems with starter code in Java/Python/JavaScript, AI evaluates your approach reasoning
- **Debugging challenges** — find and explain bugs in real code, with reveal-after-submit explanations
- **System design** — architecture prompts with evaluation criteria, hints, and AI feedback on your design approach

### Communication Intelligence
- **Voice practice** — speak answers aloud using native browser MediaRecorder + Web Speech API
- **Delivery metrics** — speaking pace (WPM), pause count, filler word detection, answer structure markers
- **Technical + delivery scored separately** — no confidence/personality/emotion inference
- **Privacy-first** — audio processed locally, never uploaded

### Resume Intelligence
- **Resume + JD matching** — paste your resume and a job description
- **Skill gap analysis** — identifies matched skills, gaps, and additional skills
- **Generated interview questions** — role-specific questions matched to your gaps

---

## Architecture

```
frontend/   React + Vite + TypeScript + Tailwind CSS
backend/    Python FastAPI + Pydantic
            └── Google Gemini API (server-side only — key never in browser)
supabase/   Postgres schema (optional — app works with localStorage without it)
```

Data flow for evaluation:
```
Browser → POST /api/evaluate (FastAPI) → Gemini API → validated JSON → browser
```
The Gemini API key lives only in the backend `.env`. It is never sent to or stored in the browser.

---

## Quick start (local)

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd "resum eproject"
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local if you want to point at a custom backend URL (optional for local dev)
npm run dev
```

The frontend runs at **http://localhost:5173**.

> **Without a backend:** The app works fully in local mode. All data is stored in your browser's localStorage. Evaluations use the built-in mock evaluator (clearly labeled in the UI).

### 3. Backend (optional — required for Gemini evaluation)

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env — set GEMINI_API_KEY (see next section)

uvicorn app.main:app --reload --port 8000
```

The backend runs at **http://localhost:8000**.  
API docs: **http://localhost:8000/docs**

The frontend Vite dev server proxies `/api/*` requests to `http://localhost:8000` automatically — no extra config needed for local development.

---

## Getting a Gemini API key

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with a Google account
3. Click **Create API key**
4. Copy the key
5. Paste it into `backend/.env` as `GEMINI_API_KEY=your_key_here`

**Free tier notes:**
- Gemini 1.5 Flash has a generous free quota (as of 2024: 15 requests/minute, 1 million tokens/day)
- Quotas and model availability can change without notice — see https://ai.google.dev/pricing
- When the quota is exhausted or the key is invalid, the backend falls back to mock evaluation and logs a warning. The frontend will show a "mock evaluation" banner. No silent zeros are returned.
- The model name is configurable via `GEMINI_MODEL` in `.env` (default: `gemini-1.5-flash`)

---

## Environment variables

### Frontend — `frontend/.env.local`

```env
# URL of your deployed backend (leave empty for local dev — Vite proxy handles it)
VITE_API_BASE_URL=

# Supabase (optional)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Backend — `backend/.env`

```env
# Required for Gemini evaluation
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash

# CORS — comma-separated allowed origins
# Local dev:
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
# Production (replace with your Vercel URL):
# ALLOWED_ORIGINS=https://preppilot-ai.vercel.app

# Optional — Supabase server-side persistence
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

ENVIRONMENT=development
```

**Security rules:**
- Never commit `.env` or `.env.local` to source control (both are in `.gitignore`)
- Never put `GEMINI_API_KEY` in `VITE_*` variables — those are exposed to the browser
- Use Render / Vercel environment variable dashboards for production secrets

---

## Running tests

### Frontend

```bash
cd frontend
npm test               # run once
npm run test:watch     # watch mode
npm run type-check     # TypeScript check only
```

### Backend

```bash
cd backend
.\.venv\Scripts\activate   # Windows
source .venv/bin/activate  # macOS/Linux

pytest tests/ -v
```

**Current test coverage:**
- Frontend: 15 tests — score calculations, evidence logic, mock evaluator
- Backend: 36 tests — health, questions, evaluator validation, session CRUD, API error handling

---

## Deployment

### Frontend → Vercel

1. Push the repo to GitHub
2. Go to **https://vercel.com** → New Project → Import your repo
3. Set **Root Directory** to `frontend`
4. Vercel auto-detects Vite — build command `npm run build`, output `dist`
5. Add environment variables in Vercel dashboard:
   ```
   VITE_API_BASE_URL = https://your-backend.onrender.com
   ```
6. Click Deploy

The `frontend/vercel.json` handles SPA routing rewrites automatically.

### Backend → Render

1. Go to **https://render.com** → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables in Render dashboard:
   ```
   GEMINI_API_KEY      = (your key — mark as secret)
   GEMINI_MODEL        = gemini-1.5-flash
   ALLOWED_ORIGINS     = https://your-app.vercel.app
   ENVIRONMENT         = production
   ```
7. Health check path: `/health`
8. Click Deploy

The `backend/render.yaml` file documents this configuration and can be used with Render's Infrastructure as Code feature.

**Free tier note:** Render free services spin down after 15 minutes of inactivity. The first request after spin-down takes ~30 seconds. For consistent availability, upgrade to a paid plan or use a service like UptimeRobot to ping `/health` every 10 minutes.

### Database → Supabase (optional)

The app works fully with browser localStorage — Supabase is only needed if you want server-side session persistence or multi-device sync.

1. Go to **https://supabase.com** → New Project
2. In the SQL Editor, paste and run `supabase/schema.sql`
3. Go to Project Settings → API → copy your project URL and service role key
4. Add to backend `.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```
5. Add to frontend `.env.local` (anon key only — never the service key):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

---

## Deployment checklist

Before going live, verify each item:

**Frontend (Vercel)**
- [ ] `VITE_API_BASE_URL` set to your Render backend URL
- [ ] Build succeeds (`npm run build` locally)
- [ ] TypeScript check passes (`npm run type-check`)
- [ ] SPA routes work (navigate to `/dashboard` directly)

**Backend (Render)**
- [ ] `GEMINI_API_KEY` set and marked as secret
- [ ] `ALLOWED_ORIGINS` includes your Vercel frontend URL (no trailing slash)
- [ ] `ENVIRONMENT=production` (disables `/docs` and `/redoc`)
- [ ] `/health` endpoint returns `200 OK`
- [ ] `gemini_available: true` in health response

**Security**
- [ ] No `.env` files committed to source control
- [ ] No `GEMINI_API_KEY` in any `VITE_*` variable
- [ ] CORS only allows known frontend origins

---

## Project structure

```
resum eproject/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Button, Card, Badge, Input, ScoreRing, ProgressBar, motion.tsx
│   │   │   └── layout/      # Navbar, AppLayout, Footer
│   │   ├── pages/           # LandingPage, DashboardPage, MockInterviewPage,
│   │   │                    # HistoryPage, SessionDetailPage, PracticePage, SettingsPage,
│   │   │                    # SkillDNAPage, RoadmapPage, AnswerEvolutionPage,
│   │   │                    # PassportPage, EngineeringLabPage, VoicePracticePage,
│   │   │                    # ResumeIntelligencePage
│   │   ├── data/            # questions.ts, labChallenges.ts
│   │   ├── lib/             # utils.ts, api.ts, localStorage.ts, mockEvaluate.ts
│   │   ├── store/           # useAppStore.ts (Zustand)
│   │   ├── types/           # index.ts — all TypeScript types
│   │   └── test/            # Vitest tests
│   ├── vercel.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/             # health.py, questions.py, evaluate.py, sessions.py, diagnostics.py
│   │   ├── core/            # config.py
│   │   ├── models/          # schemas.py (Pydantic)
│   │   └── services/        # evaluator.py, questions.py
│   ├── tests/               # 36 pytest tests
│   ├── render.yaml
│   └── requirements.txt
│
├── supabase/
│   └── schema.sql
│
└── README.md
```

---

## Readiness score explained

The readiness score is calculated transparently — the formula is shown in the dashboard:

```
readiness = min(100, avg_topic_score × 0.8 + coverage_bonus)

where:
  avg_topic_score = average of all topic average scores (0–100)
  coverage_bonus  = (topics_practiced / 6) × 20   (max 20 points)
```

**Evidence status thresholds** (shown in the Evidence Map):
- **Demonstrated** — average score ≥ 75% AND concept appeared in ≥ 2 sessions
- **Developing** — average score ≥ 50%
- **Needs Practice** — average score below 50%

These thresholds are configurable in `frontend/src/lib/utils.ts` (`calcEvidenceStatus`).

The score is a practice-progress indicator, not a prediction of interview success.

---

## Offline / mock mode

When the backend is unreachable or `GEMINI_API_KEY` is not configured:

- The frontend detects the missing backend via a `/health` check
- Evaluations fall back to the built-in mock evaluator (heuristic-based, not AI)
- Every mock evaluation is clearly labeled **"Mock evaluation"** with a warning banner
- Scores from mock evaluation are stored and counted in your dashboard like real evaluations, but the banner reminds you they are estimates
- Mock scores are based on answer length and keyword presence — they are not a substitute for Gemini evaluation

---

## Known limits and notes

- **Gemini free tier quotas change.** If you hit a quota error, the backend logs it and falls back to mock — no silent zeros.
- **Render free tier spins down.** First request after idle takes ~30s. Consider upgrading or using a keep-alive ping for production.
- **localStorage is per-browser.** Data does not sync across devices without Supabase.
- **Question bank is static.** It lives in `frontend/src/data/questions.ts` and `backend/app/services/questions.py`. Add questions there — no DB migration needed.
- **Scores are practice estimates.** PrepPilot AI does not claim its scoring predicts real interview outcomes.
