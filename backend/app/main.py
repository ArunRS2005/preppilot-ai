"""
PrepPilot AI — FastAPI backend

Entry point for the application.
Run locally:  uvicorn app.main:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import evaluate, health, questions, sessions, diagnostics
from app.core.config import get_settings

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ─── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info("PrepPilot AI starting — env=%s", settings.environment)
    logger.info("Gemini available: %s", settings.gemini_available)
    logger.info("Supabase available: %s", settings.supabase_available)
    if not settings.gemini_available:
        logger.warning(
            "GEMINI_API_KEY not configured — mock evaluation will be used. "
            "See .env.example for setup instructions."
        )
    yield
    logger.info("PrepPilot AI shutting down")


# ─── App ──────────────────────────────────────────────────────────────────────
settings = get_settings()

app = FastAPI(
    title="PrepPilot AI API",
    description="Backend API for PrepPilot AI interview readiness platform.",
    version=settings.app_version,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(questions.router)
app.include_router(evaluate.router)
app.include_router(sessions.router)
app.include_router(diagnostics.router)


# ─── Global exception handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception for %s %s: %s", request.method, request.url, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )
