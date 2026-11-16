"""
Diagnostic endpoint — verifies Gemini authentication with a live API call.
Only available in development (disabled in production).

GET /diagnostics/gemini
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])


class GeminiDiagnosticResponse(BaseModel):
    success: bool
    model: str
    key_prefix: str          # first 6 chars only — never the full key
    key_format: str          # "auth_key (AQ.)" or "standard_key (AIza)" or "unknown"
    response_text: str       # the model's reply on success
    error: str               # the actual provider error on failure
    suggestion: str          # how to fix it


@router.get("/gemini", response_model=GeminiDiagnosticResponse)
async def gemini_diagnostic() -> GeminiDiagnosticResponse:
    """
    Runs a live Gemini test call and reports exactly what happens.
    Shows the real error from the provider — never hides it.
    Only available when ENVIRONMENT != production.
    """
    settings = get_settings()

    if settings.is_production:
        raise HTTPException(status_code=404, detail="Not found")

    key = settings.gemini_api_key or ""
    key_prefix = key[:6] if len(key) >= 6 else key
    if key.startswith("AQ."):
        key_format = "auth_key (AQ.) — Google's newer authorization key format"
    elif key.startswith("AIza"):
        key_format = "standard_key (AIza) — older API key format"
    else:
        key_format = f"unknown format (prefix: {key_prefix!r})"

    if not settings.gemini_available:
        return GeminiDiagnosticResponse(
            success=False,
            model=settings.gemini_model,
            key_prefix=key_prefix,
            key_format=key_format,
            response_text="",
            error="GEMINI_API_KEY is not set or is still the placeholder value.",
            suggestion=(
                "Set GEMINI_API_KEY in backend/.env. "
                "Get a key at https://aistudio.google.com/apikey"
            ),
        )

    try:
        import asyncio
        from google import genai  # type: ignore[import]

        client = genai.Client(api_key=key)

        def _call() -> str:
            resp = client.interactions.create(
                model=settings.gemini_model,
                input="Reply with exactly three words: Gemini is working",
            )
            return resp.output_text or ""

        loop = asyncio.get_event_loop()
        text = await asyncio.wait_for(
            loop.run_in_executor(None, _call),
            timeout=20.0,
        )

        logger.info("Gemini diagnostic passed — model=%s response=%r", settings.gemini_model, text)
        return GeminiDiagnosticResponse(
            success=True,
            model=settings.gemini_model,
            key_prefix=key_prefix,
            key_format=key_format,
            response_text=text.strip(),
            error="",
            suggestion="",
        )

    except asyncio.TimeoutError:
        return GeminiDiagnosticResponse(
            success=False,
            model=settings.gemini_model,
            key_prefix=key_prefix,
            key_format=key_format,
            response_text="",
            error="Request timed out after 20 seconds.",
            suggestion=(
                "Check your internet connection. "
                "If behind a proxy or firewall, ensure generativelanguage.googleapis.com is reachable."
            ),
        )
    except Exception as exc:
        error_msg = str(exc)
        logger.error("Gemini diagnostic failed: %s", error_msg)

        # Map common errors to actionable suggestions
        if "API_KEY_INVALID" in error_msg or "invalid" in error_msg.lower():
            suggestion = "The key was rejected by the API. Regenerate it at https://aistudio.google.com/apikey"
        elif "not found" in error_msg.lower() or "404" in error_msg:
            suggestion = (
                f"Model '{settings.gemini_model}' not available for this key. "
                "Change GEMINI_MODEL in backend/.env — see /diagnostics/models for available models."
            )
        elif "quota" in error_msg.lower() or "429" in error_msg:
            suggestion = "Quota exhausted. Wait and retry, or check https://aistudio.google.com/usage"
        elif "permission" in error_msg.lower() or "403" in error_msg:
            suggestion = (
                "Permission denied. Ensure the Generative Language API is enabled "
                "in your Google Cloud project: https://console.cloud.google.com/apis/library"
            )
        else:
            suggestion = "Check the error message above and backend logs for more detail."

        return GeminiDiagnosticResponse(
            success=False,
            model=settings.gemini_model,
            key_prefix=key_prefix,
            key_format=key_format,
            response_text="",
            error=error_msg,
            suggestion=suggestion,
        )


@router.get("/models")
async def list_available_models() -> dict:
    """List Gemini models available for this API key."""
    settings = get_settings()
    if settings.is_production:
        raise HTTPException(status_code=404, detail="Not found")
    if not settings.gemini_available:
        return {"error": "GEMINI_API_KEY not configured", "models": []}

    try:
        from google import genai  # type: ignore[import]
        client = genai.Client(api_key=settings.gemini_api_key)
        # The new SDK lists models via the models resource
        models = []
        for m in client.models.list():
            name = getattr(m, "name", None) or getattr(m, "id", str(m))
            models.append(name)
        return {"models": sorted(models), "total": len(models)}
    except Exception as exc:
        return {"error": str(exc), "models": []}
