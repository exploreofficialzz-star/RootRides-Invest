import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import httpx

from database import supabase
from auth_utils import get_current_user_id
from routers.investments import generate_referral_code, credit_referrer_atomically

router = APIRouter()

FLW_SECRET_KEY = os.getenv("FLW_SECRET_KEY", "")


# ── Models ────────────────────────────────────────────────────
class PaymentVerifyRequest(BaseModel):
    transaction_id: int
    tx_ref:         str
    plan_id:        str
    plan_name:      str
    amount_naira:   int
    daily_return_naira: int


# ── Flutterwave verification ───────────────────────────────────
async def verify_flutterwave(transaction_id: int) -> dict:
    url = f"https://api.flutterwave.com/v3/transactions/{transaction_id}/verify"
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            url, headers={"Authorization": f"Bearer {FLW_SECRET_KEY}"}
        )
        return resp.json()


# ── Endpoint ──────────────────────────────────────────────────
@router.post("/payments/verify")
async def verify_payment(
    data: PaymentVerifyRequest,
    user_id: str = Depends(get_current_user_id),
):
    if not FLW_SECRET_KEY:
        raise HTTPException(500, "Payment gateway not configured")

    # 1. Verify with Flutterwave
    result = await verify_flutterwave(data.transaction_id)
    if result.get("status") != "success":
        raise HTTPException(400, "Payment verification failed with Flutterwave")

    tx = result["data"]

    # 2. Validate transaction details
    if tx.get("status") != "successful":
        raise HTTPException(400, f"Payment not successful: {tx.get('status')}")
    if tx.get("currency") != "NGN":
        raise HTTPException(400, "Invalid currency — only NGN accepted")
    if int(tx.get("amount", 0)) < data.amount_naira:
        raise HTTPException(400, "Payment amount is less than plan amount")
    if tx.get("tx_ref") != data.tx_ref:
        raise HTTPException(400, "Transaction reference mismatch")

    # 3. Prevent duplicate processing (idempotency)
    existing = (
        supabase.table("investments")
        .select("id")
        .eq("flw_tx_ref", data.tx_ref)
        .execute()
    )
    if existing.data:
        raise HTTPException(400, "This payment has already been processed")

    # 4. Create investment
    result_inv = supabase.table("investments").insert({
        "user_id":            user_id,
        "plan_id":            data.plan_id,
        "plan_name":          data.plan_name,
        "amount_naira":       data.amount_naira,
        "daily_return_naira": data.daily_return_naira,
        "is_active":          True,
        "flw_tx_ref":         data.tx_ref,
        "flw_tx_id":          str(data.transaction_id),
    }).execute()

    investment = result_inv.data[0]

    # 5. Atomic referral activation on first investment
    user_row = (
        supabase.table("users")
        .select("referral_code, referred_by")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not user_row.data.get("referral_code"):
        code = generate_referral_code(user_id)
        supabase.table("users").update({"referral_code": code}).eq("id", user_id).execute()

        ref_by = user_row.data.get("referred_by")
        if ref_by:
            credit_referrer_atomically(ref_by)

    return {
        "message":    "Payment verified and investment created",
        "investment": investment,
    }
