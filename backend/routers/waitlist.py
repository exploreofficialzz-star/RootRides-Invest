from fastapi import APIRouter, HTTPException
from database import supabase
from models import WaitlistEntry, WaitlistResponse

router = APIRouter()


@router.post("/waitlist", response_model=WaitlistResponse)
async def join_waitlist(entry: WaitlistEntry):
    """Add an email to the waitlist. Silently accepts duplicates."""
    try:
        # Check for existing email
        existing = (
            supabase.table("waitlist")
            .select("email")
            .eq("email", entry.email)
            .execute()
        )
        if existing.data:
            return WaitlistResponse(message="already_registered", email=entry.email)

        supabase.table("waitlist").insert(
            {
                "email": entry.email,
                "referral_code": entry.referral_code,
                "source": entry.source or "website",
            }
        ).execute()

        return WaitlistResponse(message="success", email=entry.email)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
