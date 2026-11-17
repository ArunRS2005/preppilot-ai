"""
Diagnostic endpoint — verifies Gemini authentication with a live API call.
Available in both development and production for debugging.
Hides the full key — only shows first 6 chars.

GET /diagnostics/gemini
GET /diagnostics/models
"""

import asyncio
import logging
import os
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])


class GeminiDiagnosticResponse(BaseModel):
    success: bool
    model: str
    key_prefix: str
    key_format: str
    response_text: str
    error: str
    suggestion: str


@router.get("/gemini", response_model=GeminiDiagnosticResponse)
async def gemini_diagnostic() -> GeminiDiagnosticResponse:
    """
    Runs a live Gemini test call and reports exactly what happens.
    Shows the real provider error — never hides it.
    """
    settings = get_settings()

    key = settings.gemini_api_key or ""
    key_prefix = key[:6] if len(key) >= 6 else key
    if key.startswith("AQ."):
        key_format = "auth_key (AQ.) — Google authorization key"
    elif key.startswith("AIza"):
        key_format = "standard_key (AIza)"
    else:
        key_format = f"unknown format (prefix: {key_prefix!r})"

    if not settings.gemini_available:
        return GeminiDiagnosticResponse(
            success=False, model=settings.gemini_model, key_prefix=key_prefix,
            key_format=key_format, response_text="",
            error="GEMINI_API_KEY not set or is placeholder.",
            suggestion="Set GEMINI_API_KEY in environment variables.",
        )

    # Try generate_content first
    try:
        from google import genai  # type: ignore[import]
        client = genai.Client(api_key=key)

        def _call_generate() -> str:
            resp = client.models.generate_content(
                model=settings.gemini_model,
                contents="Reply with exactly three words: Gemini is working",
            )
            return resp.text or ""

        text = await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(None, _call_generate),
            timeout=25.0,
        )

        logger.info("Gemini diagnostic passed — model=%s", settings.gemini_model)
        return GeminiDiagnosticResponse(
            success=True, model=settings.gemini_model, key_prefix=key_prefix,
            key_format=key_format, response_text=text.strip(), error="", suggestion="",
        )

    except asyncio.TimeoutError:
        return GeminiDiagnosticResponse(
            success=False, model=settings.gemini_model, key_prefix=key_prefix,
            key_format=key_format, response_text="",
            error="Request timed out after 25s — generate_content hung.",
            suggestion="Check if generativelanguage.googleapis.com is reachable from this server.",
        )
    except Exception as exc:
        error_msg = str(exc)
        logger.error("Gemini diagnostic failed: %s", error_msg)

        if "not found" in error_msg.lower() or "404" in error_msg:
            suggestion = f"Model '{settings.gemini_model}' not available. Check /diagnostics/models."
        elif "api_key_invalid" in error_msg.lower() or "invalid" in error_msg.lower():
            suggestion = "Key rejected. Regenerate at https://aistudio.google.com/apikey"
        elif "quota" in error_msg.lower() or "429" in error_msg:
            suggestion = "Quota exhausted. Check https://aistudio.google.com/usage"
        elif "403" in error_msg or "permission" in error_msg.lower():
            suggestion = "Permission denied. Ensure Generative Language API is enabled."
        else:
            suggestion = "Check the full error message above."

        return GeminiDiagnosticResponse(
            success=False, model=settings.gemini_model, key_prefix=key_prefix,
            key_format=key_format, response_text="", error=error_msg, suggestion=suggestion,
        )


@router.get("/models")
async def list_available_models() -> dict:
    """List Gemini models available for this API key."""
    settings = get_settings()
    if not settings.gemini_available:
        return {"error": "GEMINI_API_KEY not configured", "models": []}

    try:
        from google import genai  # type: ignore[import]
        client = genai.Client(api_key=settings.gemini_api_key)
        models = []
        for m in client.models.list():
            name = getattr(m, "name", None) or getattr(m, "id", str(m))
            models.append(name)
        return {"models": sorted(models), "total": len(models), "current_model": settings.gemini_model}
    except Exception as exc:
        return {"error": str(exc), "models": []}
