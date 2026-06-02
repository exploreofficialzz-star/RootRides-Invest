from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class Plan(BaseModel):
    id: UUID; name: str; amount_naira: int; daily_return_naira: int
    image_path: str; gradient: str; is_dark: bool; grid_span: str; display_order: int

class PlatformStats(BaseModel):
    total_invested: int; active_users: int; uptime_percent: float; support_label: str

class Testimonial(BaseModel):
    id: UUID; quote: str; name: str; plan_label: str; display_order: int

class FaqItem(BaseModel):
    id: UUID; question: str; answer: str; display_order: int

class WaitlistEntry(BaseModel):
    email: EmailStr; referral_code: Optional[str] = None; source: Optional[str] = "website"

class WaitlistResponse(BaseModel):
    message: str; email: str

class RegisterRequest(BaseModel):
    phone: str
    full_name: str
    password: str
    referred_by: Optional[str] = None   # referral code of the person who invited them

class LoginRequest(BaseModel):
    phone: str; password: str

class UserOut(BaseModel):
    id: str; phone: str; full_name: str

class AuthResponse(BaseModel):
    token: str; user: UserOut
