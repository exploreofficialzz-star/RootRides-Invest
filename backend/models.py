from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


# ── Plans ──────────────────────────────────────────────────────────────────────

class Plan(BaseModel):
    id: UUID
    name: str
    amount_naira: int
    daily_return_naira: int
    image_path: str
    gradient: str
    is_dark: bool
    grid_span: str
    display_order: int


# ── Stats ──────────────────────────────────────────────────────────────────────

class PlatformStats(BaseModel):
    total_invested: int
    active_users: int
    uptime_percent: float
    support_label: str


# ── Testimonials ───────────────────────────────────────────────────────────────

class Testimonial(BaseModel):
    id: UUID
    quote: str
    name: str
    plan_label: str
    display_order: int


# ── FAQ ────────────────────────────────────────────────────────────────────────

class FaqItem(BaseModel):
    id: UUID
    question: str
    answer: str
    display_order: int


# ── Waitlist ───────────────────────────────────────────────────────────────────

class WaitlistEntry(BaseModel):
    email: EmailStr
    referral_code: Optional[str] = None
    source: Optional[str] = "website"


class WaitlistResponse(BaseModel):
    message: str   # "success" | "already_registered"
    email: str
