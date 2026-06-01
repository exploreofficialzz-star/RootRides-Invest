from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import supabase
from auth_utils import get_current_user_id
import uuid

router = APIRouter()


# ── Models ────────────────────────────────────────────────────────────────────

class CreateInvestmentRequest(BaseModel):
    plan_id: str
    plan_name: str
    amount_naira: int
    daily_return_naira: int


class UserStats(BaseModel):
    total_invested: int
    total_earned: int
    today_potential: int
    has_investments: bool
    referral_code: str | None
    referral_earnings: int


# ── Helpers ───────────────────────────────────────────────────────────────────

def generate_referral_code(user_id: str) -> str:
    return "RR" + user_id.replace("-", "").upper()[:6]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/investments")
async def create_investment(
    data: CreateInvestmentRequest,
    user_id: str = Depends(get_current_user_id),
):
    # Create investment record
    result = supabase.table("investments").insert({
        "user_id":            user_id,
        "plan_id":            data.plan_id,
        "plan_name":          data.plan_name,
        "amount_naira":       data.amount_naira,
        "daily_return_naira": data.daily_return_naira,
        "is_active":          True,
    }).execute()

    investment = result.data[0]

    # On first investment → generate referral code for this user
    user_row = supabase.table("users").select("referral_code").eq("id", user_id).single().execute()
    if not user_row.data.get("referral_code"):
        code = generate_referral_code(user_id)
        supabase.table("users").update({"referral_code": code}).eq("id", user_id).execute()

        # Credit referrer ₦3,000 if user was referred
        referred = supabase.table("users").select("referred_by").eq("id", user_id).single().execute()
        ref_by = referred.data.get("referred_by")
        if ref_by:
            referrer = supabase.table("users").select("id, referral_earnings").eq("referral_code", ref_by).execute()
            if referrer.data:
                current = referrer.data[0].get("referral_earnings", 0) or 0
                supabase.table("users").update(
                    {"referral_earnings": current + 3000}
                ).eq("id", referrer.data[0]["id"]).execute()

    return {"message": "Investment created", "investment": investment}


@router.get("/user/stats", response_model=UserStats)
async def get_user_stats(user_id: str = Depends(get_current_user_id)):
    # Active investments
    inv = supabase.table("investments").select("*").eq("user_id", user_id).eq("is_active", True).execute()
    investments = inv.data or []

    total_invested  = sum(i["amount_naira"] for i in investments)
    today_potential = sum(i["daily_return_naira"] for i in investments)

    # Total earned (all claims ever)
    claims = supabase.table("daily_claims").select("amount_naira").eq("user_id", user_id).execute()
    total_earned = sum(c["amount_naira"] for c in (claims.data or []))

    # User referral info
    user_row = supabase.table("users").select("referral_code, referral_earnings").eq("id", user_id).single().execute()
    ref_code     = user_row.data.get("referral_code")
    ref_earnings = user_row.data.get("referral_earnings") or 0

    return UserStats(
        total_invested=total_invested,
        total_earned=total_earned,
        today_potential=today_potential,
        has_investments=len(investments) > 0,
        referral_code=ref_code,
        referral_earnings=ref_earnings,
    )


@router.get("/user/investments")
async def get_user_investments(user_id: str = Depends(get_current_user_id)):
    result = supabase.table("investments").select("*").eq("user_id", user_id).eq("is_active", True).order("started_at").execute()
    return result.data or []
