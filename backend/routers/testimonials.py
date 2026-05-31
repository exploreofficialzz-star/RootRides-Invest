from fastapi import APIRouter, HTTPException
from typing import List
from database import supabase
from models import Testimonial

router = APIRouter()


@router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials():
    """Return all active testimonials ordered by display_order."""
    try:
        response = (
            supabase.table("testimonials")
            .select("*")
            .eq("is_active", True)
            .order("display_order")
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
