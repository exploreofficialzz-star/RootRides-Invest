from fastapi import APIRouter, HTTPException
from typing import List
from database import supabase
from models import FaqItem

router = APIRouter()


@router.get("/faq", response_model=List[FaqItem])
async def get_faq():
    """Return all active FAQ items ordered by display_order."""
    try:
        response = (
            supabase.table("faq_items")
            .select("*")
            .eq("is_active", True)
            .order("display_order")
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
