from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import supabase
from auth_utils import get_current_user_id

router = APIRouter()


# ── Models ────────────────────────────────────────────────────
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


# ── Helpers ───────────────────────────────────────────────────
def generate_referral_code(user_id: str) -> str:
    return "RR" + user_id.replace("-", "").upper()[:6]


def credit_referrer_atomically(ref_by: str, amount: int = 3000) -> None:
    """Atomically increment referral_earnings using a SQL RPC.
    Avoids the read-modify-write race condition present in naive Python logic.
    """
    try:
        supabase.rpc(
            "increment_referral_earnings",
            {"referrer_code": ref_by, "amount": amount},
        ).execute()
    except Exception:
        pass  # Non-fatal — log in production monitoring


def maybe_activate_referral(user_id: str) -> None:
    """On first investment: generate referral code + credit the referrer."""
    user_row = (
        supabase.table("users")
        .select("referral_code, referred_by")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if user_row.data.get("referral_code"):
        return  # Already activated

    code = generate_referral_code(user_id)
    supabase.table("users").update({"referral_code": code}).eq("id", user_id).execute()

    ref_by = user_row.data.get("referred_by")
    if ref_by:
        credit_referrer_atomically(ref_by)


# ── Endpoints ─────────────────────────────────────────────────
@router.post("/investments")
async def create_investment(
    data: CreateInvestmentRequest,
    user_id: str = Depends(get_current_user_id),
):
    result = supabase.table("investments").insert({
        "user_id":            user_id,
        "plan_id":            data.plan_id,
        "plan_name":          data.plan_name,
        "amount_naira":       data.amount_naira,
        "daily_return_naira": data.daily_return_naira,
        "is_active":          True,
    }).execute()

    investment = result.data[0]
    maybe_activate_referral(user_id)
    return {"message": "Investment created", "investment": investment}


@router.get("/user/stats", response_model=UserStats)
async def get_user_stats(user_id: str = Depends(get_current_user_id)):
    inv = (
        supabase.table("investments")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    )
    investments = inv.data or []

    total_invested  = sum(i["amount_naira"] for i in investments)
    today_potential = sum(i["daily_return_naira"] for i in investments)

    claims = (
        supabase.table("daily_claims")
        .select("amount_naira")
        .eq("user_id", user_id)
        .execute()
    )
    total_earned = sum(c["amount_naira"] for c in (claims.data or []))

    user_row = (
        supabase.table("users")
        .select("referral_code, referral_earnings")
        .eq("id", user_id)
        .single()
        .execute()
    )
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
    result = (
        supabase.table("investments")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .order("started_at")
        .execute()
    )
    return result.data or []
