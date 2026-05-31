# RootRides Invest

Nigerian investment platform — earn daily returns on real assets.

## Monorepo Structure

```
rootrides/
├── frontend/          React + Vite + TypeScript + Tailwind + Three.js
├── backend/           FastAPI + Supabase
├── schema.sql         Run this in Supabase SQL Editor first
├── render.yaml        Render deploy config (backend)
└── .gitignore
```

---

## Quick Start

### 1. Supabase (Database)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the contents of `schema.sql` → **Run**
3. Copy your **Project URL** and **anon key** from **Project Settings → API**

---

### 2. Backend (FastAPI on Render)

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_KEY, FRONTEND_URL
pip install -r requirements.txt
uvicorn main:app --reload
```

**Deploy to Render:**
- Connect your GitHub repo
- Render auto-reads `render.yaml` — no config needed
- Add env vars in the Render dashboard:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `FRONTEND_URL` → your Vercel URL once deployed

API docs available at `https://your-render-url.onrender.com/docs`

---

### 3. Frontend (React on Vercel)

```bash
cd frontend
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

**Deploy to Vercel:**
- Import your GitHub repo at [vercel.com](https://vercel.com)
- Set **Root Directory** → `frontend`
- Add env var: `VITE_API_URL` → your Render backend URL
- Deploy

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/plans` | Investment plans |
| GET | `/api/stats` | Platform stats |
| GET | `/api/testimonials` | Testimonials |
| GET | `/api/faq` | FAQ items |
| POST | `/api/waitlist` | Email signup `{ email, referral_code? }` |
| GET | `/health` | Health check |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind 3 |
| Animations | Three.js, Framer Motion, Canvas 2D |
| Backend | FastAPI, Uvicorn |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel (frontend) + Render (backend) |
