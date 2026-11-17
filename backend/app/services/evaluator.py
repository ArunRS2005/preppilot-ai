"""
Gemini-based answer evaluation service.

Uses the canonical google-genai SDK v3+ with generate_content (stable REST).
The Interactions API was replaced here with generate_content because
the Interactions API uses HTTP/2 streaming which is blocked in some
network environments (Render free tier, local networks, etc.).

generate_content uses a standard HTTPS POST — universally compatible.

Auth keys (AQ. prefix) and standard keys (AIza prefix) both work.
"""

from __future__ import annotations

import json
import logging
import random
import re
from typing import Any, Dict, List

from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)

from app.core.config import get_settings
from app.models.schemas import Difficulty, EvaluationResult, TopicKey

logger = logging.getLogger(__name__)

# ─── Client (lazy init) ───────────────────────────────────────────────────────

_client = None


def _get_client():
    """Lazily initialise the google-genai Client. Returns None if unavailable."""
    global _client
    if _client is not None:
        return _client

    settings = get_settings()
    if not settings.gemini_available:
        return None

    try:
        from google import genai  # type: ignore[import]
        _client = genai.Client(api_key=settings.gemini_api_key)
        logger.info("google-genai client initialised (model=%s)", settings.gemini_model)
        return _client
    except Exception as exc:
        logger.warning("Failed to initialise google-genai client: %s", exc)
        return None


# ─── Personality instructions ─────────────────────────────────────────────────

PERSONALITY_INSTRUCTIONS: dict[str, str] = {
    "friendly_mentor": (
        "You are a supportive and encouraging interviewer. "
        "Acknowledge effort before pointing out gaps. "
        "Frame improvements as learning opportunities."
    ),
    "strict_technical": (
        "You are a strict technical interviewer who expects precise, accurate answers. "
        "Be direct. Do not soften critical feedback. "
        "Specifically call out any technical inaccuracies."
    ),
    "senior_engineer": (
        "You are an experienced senior engineer who cares about trade-offs, "
        "real-world applicability, and depth. "
        "Reflect that in your evaluation."
    ),
    "stress_interviewer": (
        "You are a challenging but professional interviewer. "
        "Be demanding. Call out weak assumptions directly. "
        "Score conservatively on incompleteness."
    ),
    "engineering_manager": (
        "You are an engineering manager who values ownership, clear communication, "
        "and structured thinking. Reward clear reasoning."
    ),
}

# ─── Prompt ───────────────────────────────────────────────────────────────────

SYSTEM_INSTRUCTION = """You are a technical interview evaluator assessing a candidate's answer.
Evaluate based on meaning, correctness, and completeness — NOT keyword matching.
A short but accurate answer scores higher than a long inaccurate one.

Respond ONLY with valid JSON. No markdown, no explanation, nothing outside the JSON.

Schema:
{
  "technical_score": <integer 0-100>,
  "completeness_score": <integer 0-100>,
  "clarity_score": <integer 0-100>,
  "overall_score": <integer 0-100>,
  "strengths": [<string>, ...],
  "improvements": [<string>, ...],
  "demonstrated_concepts": [<string>, ...],
  "missing_concepts": [<string>, ...]
}

Scoring guide:
85-100  Excellent — accurate, thorough, well-explained
70-84   Good — mostly correct with minor gaps
55-69   Fair — correct foundation but missing key elements
40-54   Needs work — partial understanding, notable errors
0-39    Poor — largely incorrect or insufficient

Rules:
- overall_score reflects overall quality, not a simple average
- strengths: 1-3 specific things done well (empty list if nothing noteworthy)
- improvements: 1-3 specific actionable suggestions (always at least one)
- demonstrated_concepts: specific concepts correctly addressed
- missing_concepts: specific concepts not covered
- All scores must be integers 0-100"""


def _build_prompt(
    question_text: str,
    answer_text: str,
    topic: str,
    difficulty: str,
    personality: str = "friendly_mentor",
) -> str:
    persona = PERSONALITY_INSTRUCTIONS.get(
        personality, PERSONALITY_INSTRUCTIONS["friendly_mentor"]
    )
    return (
        f"{SYSTEM_INSTRUCTION}\n\n"
        f"Evaluator context: {persona}\n\n"
        f"Topic: {topic.upper()}\n"
        f"Difficulty: {difficulty}\n"
        f"Question: {question_text}\n\n"
        f"Candidate's Answer:\n{answer_text}\n\n"
        f"Evaluate and return JSON only."
    )


# ─── Retry on transient errors ────────────────────────────────────────────────

class _TransientError(Exception):
    pass


def _is_transient(exc: Exception) -> bool:
    msg = str(exc).lower()
    return any(k in msg for k in ["429", "503", "rate limit", "quota", "timeout", "unavailable"])


@retry(
    retry=retry_if_exception_type(_TransientError),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    before_sleep=before_sleep_log(logger, logging.WARNING),
    reraise=True,
)
async def _call_gemini(prompt: str) -> str:
    """
    Call Gemini using generate_content (stable HTTPS POST).
    Runs the synchronous SDK call in a thread pool executor.
    """
    import asyncio

    client = _get_client()
    if client is None:
        raise RuntimeError("Gemini client not available")

    settings = get_settings()

    def _sync_call() -> str:
        # Use generate_content — universally supported, standard HTTP POST
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
        )
        return response.text or ""

    try:
        loop = asyncio.get_event_loop()
        text = await asyncio.wait_for(
            loop.run_in_executor(None, _sync_call),
            timeout=30.0,
        )
        return text
    except asyncio.TimeoutError:
        raise _TransientError("Gemini request timed out after 30s")
    except Exception as exc:
        if _is_transient(exc):
            raise _TransientError(str(exc)) from exc
        raise


# ─── Response validation ──────────────────────────────────────────────────────

REQUIRED_FIELDS = {
    "technical_score", "completeness_score", "clarity_score",
    "overall_score", "strengths", "improvements",
    "demonstrated_concepts", "missing_concepts",
}


def _validate(raw: Dict[str, Any]) -> Dict[str, Any]:
    missing = REQUIRED_FIELDS - raw.keys()
    if missing:
        raise ValueError(f"Missing fields: {missing}")

    def int_score(val: Any, name: str) -> int:
        try:
            v = int(val)
        except (TypeError, ValueError):
            raise ValueError(f"'{name}' must be integer, got {val!r}")
        if not 0 <= v <= 100:
            raise ValueError(f"'{name}'={v} out of range [0,100]")
        return v

    def str_list(val: Any, name: str) -> List[str]:
        if not isinstance(val, list):
            raise ValueError(f"'{name}' must be a list")
        return [str(x) for x in val[:5]]

    return {
        "technical_score":       int_score(raw["technical_score"],    "technical_score"),
        "completeness_score":    int_score(raw["completeness_score"], "completeness_score"),
        "clarity_score":         int_score(raw["clarity_score"],      "clarity_score"),
        "overall_score":         int_score(raw["overall_score"],      "overall_score"),
        "strengths":             str_list(raw["strengths"],             "strengths"),
        "improvements":          str_list(raw["improvements"],          "improvements"),
        "demonstrated_concepts": str_list(raw["demonstrated_concepts"], "demonstrated_concepts"),
        "missing_concepts":      str_list(raw["missing_concepts"],      "missing_concepts"),
    }


def _parse(text: str) -> Dict[str, Any]:
    clean = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)
    try:
        raw = json.loads(clean)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Model returned invalid JSON: {exc}\nRaw text: {text[:300]}") from exc
    return _validate(raw)


# ─── Public evaluation function ───────────────────────────────────────────────

async def evaluate_answer(
    session_id: str,
    question_id: str,
    question_text: str,
    answer_text: str,
    topic: TopicKey,
    difficulty: Difficulty,
    personality: str = "friendly_mentor",
) -> EvaluationResult:
    """
    Evaluate a candidate's answer.
    Uses generate_content (standard HTTP POST — works everywhere).
    Falls back to mock only if Gemini is genuinely unavailable.
    Never returns a silent zero.
    """
    client = _get_client()
    if client is not None:
        prompt = _build_prompt(
            question_text, answer_text, topic.value, difficulty.value, personality
        )
        try:
            raw_text = await _call_gemini(prompt)
            data = _parse(raw_text)
            return EvaluationResult(
                session_id=session_id,
                question_id=question_id,
                is_mock=False,
                **data,
            )
        except _TransientError as exc:
            logger.error("Gemini transient error after retries: %s — using mock", exc)
        except ValueError as exc:
            logger.error("Gemini response validation failed: %s — using mock", exc)
        except Exception as exc:
            logger.error("Unexpected Gemini error: %s — using mock", exc)

    logger.info("Mock evaluation: session=%s question=%s", session_id, question_id)
    return _mock_evaluate(session_id, question_id, answer_text, difficulty)


# ─── Mock evaluator ───────────────────────────────────────────────────────────

def _mock_evaluate(
    session_id: str,
    question_id: str,
    answer_text: str,
    difficulty: Difficulty,
) -> EvaluationResult:
    """Heuristic mock. Used only when Gemini is unavailable. Always is_mock=True."""
    words = len(answer_text.strip().split())
    base = int(min(88, max(15, words * 1.8 + {"easy": 5, "medium": 0, "hard": -5}.get(difficulty.value, 0))))

    def j(n: int, lo: int = -8, hi: int = 8) -> int:
        return max(0, min(100, n + random.randint(lo, hi)))

    technical    = j(base)
    completeness = j(base, -5, 10)
    clarity      = j(base, -6, 6)
    overall      = (technical + completeness + clarity) // 3

    strengths = []
    if words >= 60:
        strengths.append("Provided a reasonably detailed explanation.")
    if words >= 20:
        strengths.append("Demonstrated some familiarity with the topic.")

    improvements = [
        "Include specific examples to strengthen your answer.",
        "Review the topic fundamentals." if overall < 60
        else "Expand on edge cases and trade-offs for a more complete answer.",
    ]

    return EvaluationResult(
        session_id=session_id,
        question_id=question_id,
        technical_score=technical,
        completeness_score=completeness,
        clarity_score=clarity,
        overall_score=overall,
        strengths=strengths[:2],
        improvements=improvements[:2],
        demonstrated_concepts=[],
        missing_concepts=[],
        is_mock=True,
    )
