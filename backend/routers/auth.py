import os
import re
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from jose import jwt

from database import supabase
from models import RegisterRequest, LoginRequest, AuthResponse, UserOut

router = APIRouter()

# ── Security setup ────────────────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY  = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
ALGORITHM   = "HS256"
EXPIRE_DAYS = 7


# ── Nigerian phone validation ─────────────────────────────────────────────────
# Local:  0[7|8|9]XXXXXXXXX  → exactly 11 digits
# Intl:  +234[7|8|9]XXXXXXXXX → exactly 13 characters

LOCAL_PATTERN = re.compile(r"^0[789]\d{9}$")
INTL_PATTERN  = re.compile(r"^\+234[789]\d{9}$")


def validate_nigerian_phone(phone: str) -> str:
    """Validate and normalize phone to +234 format. Raises HTTPException if invalid."""
    cleaned = phone.strip().replace(" ", "").replace("-", "")

    if LOCAL_PATTERN.match(cleaned):
        return "+234" + cleaned[1:]      # 0801... → +234801...

    if INTL_PATTERN.match(cleaned):
        return cleaned                   # already normalized

    # Give specific error messages
    if cleaned.startswith("0") and len(cleaned) != 11:
        raise HTTPException(400, f"Numbers starting with 0 must be 11 digits (got {len(cleaned)})")
    if cleaned.startswith("+234") and len(cleaned) != 13:
        raise HTTPException(400, f"Numbers starting with +234 must be 13 characters (got {len(cleaned)})")
    if not re.match(r"^(0|\+234)", cleaned):
        raise HTTPException(400, "Phone must start with 0 or +234")
    if not re.match(r"^(0|\+234)[789]", cleaned):
        raise HTTPException(400, "Phone prefix must be 070, 080, or 090 series")

    raise HTTPException(400, "Invalid Nigerian phone number")


def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=EXPIRE_DAYS)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/auth/register", response_model=AuthResponse)
async def register(data: RegisterRequest):
    phone = validate_nigerian_phone(data.phone)

    if not data.full_name.strip():
        raise HTTPException(400, "Full name is required")
    if len(data.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")

    # Check duplicate
    existing = supabase.table("users").select("id").eq("phone", phone).execute()
    if existing.data:
        raise HTTPException(400, "Phone number already registered")

    password_hash = pwd_context.hash(data.password)

    result = supabase.table("users").insert({
        "phone":         phone,
        "full_name":     data.full_name.strip(),
        "password_hash": password_hash,
    }).execute()

    user = result.data[0]
    return AuthResponse(
        token=create_token(user["id"]),
        user=UserOut(id=user["id"], phone=user["phone"], full_name=user["full_name"]),
    )


@router.post("/auth/login", response_model=AuthResponse)
async def login(data: LoginRequest):
    phone = validate_nigerian_phone(data.phone)

    result = supabase.table("users").select("*").eq("phone", phone).execute()
    if not result.data:
        raise HTTPException(401, "Invalid phone number or password")

    user = result.data[0]

    if not pwd_context.verify(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid phone number or password")

    return AuthResponse(
        token=create_token(user["id"]),
        user=UserOut(id=user["id"], phone=user["phone"], full_name=user["full_name"]),
    )
