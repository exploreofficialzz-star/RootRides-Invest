from fastapi import APIRouter, HTTPException
from typing import List
from database import supabase
from models import Plan

router = APIRouter()


@router.get("/plans", response_model=List[Plan])
async def get_plans():
    """Return all active investment plans ordered by display_order."""
    try:
        response = (
            supabase.table("plans")
            .select("*")
            .eq("is_active", True)
            .order("display_order")
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
