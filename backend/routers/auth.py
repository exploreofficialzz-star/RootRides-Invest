import os, re
from datetime import datetime, timedelta, timezone
import bcrypt
from fastapi import APIRouter, HTTPException
from jose import jwt
from database import supabase
from models import RegisterRequest, LoginRequest, AuthResponse, UserOut

router = APIRouter()

SECRET_KEY  = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
ALGORITHM   = "HS256"
EXPIRE_DAYS = 7

LOCAL_RE = re.compile(r"^0[789]\d{9}$")
INTL_RE  = re.compile(r"^\+234[789]\d{9}$")

def validate_and_normalize_phone(raw: str) -> str:
    phone = raw.strip().replace(" ", "").replace("-", "")
    if LOCAL_RE.match(phone): return "+234" + phone[1:]
    if INTL_RE.match(phone):  return phone
    if phone.startswith("0") and len(phone) != 11:
        raise HTTPException(400, f"Numbers starting with 0 must be 11 digits (got {len(phone)})")
    if phone.startswith("+234") and len(phone) != 13:
        raise HTTPException(400, f"Numbers starting with +234 must be 13 characters (got {len(phone)})")
    if not re.match(r"^(0|\+234)", phone):
        raise HTTPException(400, "Phone must start with 0 or +234")
    raise HTTPException(400, "Invalid Nigerian phone number")

def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=EXPIRE_DAYS)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/auth/register", response_model=AuthResponse)
async def register(data: RegisterRequest):
    phone = validate_and_normalize_phone(data.phone)
    if not data.full_name.strip(): raise HTTPException(400, "Full name is required")
    if len(data.password) < 6:     raise HTTPException(400, "Password must be at least 6 characters")

    existing = supabase.table("users").select("id").eq("phone", phone).execute()
    if existing.data: raise HTTPException(400, "Phone number already registered")

    # Validate referral code if provided (must exist)
    referred_by = None
    if data.referred_by:
        ref_check = supabase.table("users").select("id").eq("referral_code", data.referred_by.upper()).execute()
        if ref_check.data:
            referred_by = data.referred_by.upper()

    password_hash = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    result = supabase.table("users").insert({
        "phone":         phone,
        "full_name":     data.full_name.strip(),
        "password_hash": password_hash,
        "referred_by":   referred_by,   # stored; ₦3,000 credited on first investment
    }).execute()

    user = result.data[0]
    return AuthResponse(
        token=create_token(user["id"]),
        user=UserOut(id=user["id"], phone=user["phone"], full_name=user["full_name"]),
    )

@router.post("/auth/login", response_model=AuthResponse)
async def login(data: LoginRequest):
    phone = validate_and_normalize_phone(data.phone)
    result = supabase.table("users").select("*").eq("phone", phone).execute()
    if not result.data: raise HTTPException(401, "Invalid phone number or password")
    user = result.data[0]
    if not bcrypt.checkpw(data.password.encode("utf-8"), user["password_hash"].encode("utf-8")):
        raise HTTPException(401, "Invalid phone number or password")
    return AuthResponse(
        token=create_token(user["id"]),
        user=UserOut(id=user["id"], phone=user["phone"], full_name=user["full_name"]),
    )
