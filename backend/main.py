import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import plans, stats, testimonials, faq, waitlist

load_dotenv()

app = FastAPI(
    title="RootRides Invest API",
    description="Backend API for the RootRides Invest platform",
    version="1.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(plans.router,        prefix="/api", tags=["Plans"])
app.include_router(stats.router,        prefix="/api", tags=["Stats"])
app.include_router(testimonials.router, prefix="/api", tags=["Testimonials"])
app.include_router(faq.router,          prefix="/api", tags=["FAQ"])
app.include_router(waitlist.router,     prefix="/api", tags=["Waitlist"])


# ── Health ─────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "RootRides Invest API"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
