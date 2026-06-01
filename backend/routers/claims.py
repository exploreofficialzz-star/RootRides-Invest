from fastapi import APIRouter, HTTPException, Depends
from database import supabase
from auth_utils import get_current_user_id
from datetime import date

router = APIRouter()


@router.post("/claims/{investment_id}")
async def claim_daily_profit(
    investment_id: str,
    user_id: str = Depends(get_current_user_id),
):
    today = date.today().isoformat()

    # Verify investment belongs to this user
    inv = supabase.table("investments").select("*").eq("id", investment_id).eq("user_id", user_id).eq("is_active", True).execute()
    if not inv.data:
        raise HTTPException(404, "Investment not found")
    investment = inv.data[0]

    # Check if already claimed today
    existing = supabase.table("daily_claims").select("id").eq("investment_id", investment_id).eq("claim_date", today).execute()
    if existing.data:
        raise HTTPException(400, "Already claimed today — come back tomorrow")

    # Create claim
    result = supabase.table("daily_claims").insert({
        "user_id":       user_id,
        "investment_id": investment_id,
        "amount_naira":  investment["daily_return_naira"],
        "claim_date":    today,
    }).execute()

    return {
        "message": "Claimed successfully",
        "amount_naira": investment["daily_return_naira"],
        "claim": result.data[0],
    }


@router.get("/claims/today")
async def get_today_claims(user_id: str = Depends(get_current_user_id)):
    """Returns list of investment_ids already claimed today."""
    today = date.today().isoformat()
    result = supabase.table("daily_claims").select("investment_id").eq("user_id", user_id).eq("claim_date", today).execute()
    return [row["investment_id"] for row in (result.data or [])]
