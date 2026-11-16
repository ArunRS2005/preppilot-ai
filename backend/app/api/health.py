from fastapi import APIRouter
from app.core.config import get_settings
from app.models.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> HealthResponse:
    """Health check endpoint. Used by deployment platforms and frontend availability check."""
    settings = get_settings()
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        gemini_available=settings.gemini_available,
        supabase_available=settings.supabase_available,
        environment=settings.environment,
    )
