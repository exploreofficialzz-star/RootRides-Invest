import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import plans, stats, testimonials, faq, waitlist, auth, investments, claims

load_dotenv()

app = FastAPI(title="RootRides Invest API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plans.router,        prefix="/api", tags=["Plans"])
app.include_router(stats.router,        prefix="/api", tags=["Stats"])
app.include_router(testimonials.router, prefix="/api", tags=["Testimonials"])
app.include_router(faq.router,          prefix="/api", tags=["FAQ"])
app.include_router(waitlist.router,     prefix="/api", tags=["Waitlist"])
app.include_router(auth.router,         prefix="/api", tags=["Auth"])
app.include_router(investments.router,  prefix="/api", tags=["Investments"])
app.include_router(claims.router,       prefix="/api", tags=["Claims"])

@app.get("/")
def root():
    return {"status": "ok", "service": "RootRides Invest API"}

@app.get("/health")
def health():
    return {"status": "healthy"}
