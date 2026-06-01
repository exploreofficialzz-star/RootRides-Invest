import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import plans, stats, testimonials, faq, waitlist, auth

load_dotenv()

app = FastAPI(
    title="RootRides Invest API",
    version="1.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow all origins — safe since we have no cookies
    allow_credentials=False,
    allow_methods=["*"],          # includes OPTIONS preflight
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(plans.router,        prefix="/api", tags=["Plans"])
app.include_router(stats.router,        prefix="/api", tags=["Stats"])
app.include_router(testimonials.router, prefix="/api", tags=["Testimonials"])
app.include_router(faq.router,          prefix="/api", tags=["FAQ"])
app.include_router(waitlist.router,     prefix="/api", tags=["Waitlist"])
app.include_router(auth.router,         prefix="/api", tags=["Auth"])

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "RootRides Invest API"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
