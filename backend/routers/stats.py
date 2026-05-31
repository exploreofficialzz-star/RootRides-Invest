from fastapi import APIRouter, HTTPException
from database import supabase
from models import PlatformStats

router = APIRouter()


@router.get("/stats", response_model=PlatformStats)
async def get_stats():
    """Return the single platform stats row."""
    try:
        response = (
            supabase.table("platform_stats")
            .select("*")
            .eq("id", 1)
            .single()
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
