import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from rate_limit import limiter
from routers import plans, stats, testimonials, faq, waitlist, auth, investments, claims, payments

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("rootrides")

app = FastAPI(title="RootRides Invest API", version="1.0.0")

# ── Rate limiter ───────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ───────────────────────────────────────────────────────
# Lock down to your actual frontend domain in production.
# Set FRONTEND_URL env var on Render, e.g. https://root-rides-invest.vercel.app
_frontend = os.getenv("FRONTEND_URL", "")
_origins  = [_frontend] if _frontend else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# ── Global exception handler ───────────────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again."},
    )

# ── Routers ───────────────────────────────────────────────────
app.include_router(plans.router,        prefix="/api", tags=["Plans"])
app.include_router(stats.router,        prefix="/api", tags=["Stats"])
app.include_router(testimonials.router, prefix="/api", tags=["Testimonials"])
app.include_router(faq.router,          prefix="/api", tags=["FAQ"])
app.include_router(waitlist.router,     prefix="/api", tags=["Waitlist"])
app.include_router(auth.router,         prefix="/api", tags=["Auth"])
app.include_router(investments.router,  prefix="/api", tags=["Investments"])
app.include_router(claims.router,       prefix="/api", tags=["Claims"])
app.include_router(payments.router,     prefix="/api", tags=["Payments"])

@app.get("/")
def root():
    return {"status": "ok", "service": "RootRides Invest API"}

@app.get("/health")
def health():
    return {"status": "healthy"}
