import logging
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import EvaluateRequest, EvaluateResponse
from app.services.evaluator import evaluate_answer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["evaluation"])


@router.post("/evaluate", response_model=EvaluateResponse, status_code=status.HTTP_200_OK)
async def evaluate_answer_endpoint(req: EvaluateRequest) -> EvaluateResponse:
    """
    Evaluate a candidate's answer using Gemini AI.

    Falls back to mock evaluation when Gemini is unavailable.
    The response always includes `is_mock: true/false` so the frontend
    can clearly indicate when a mock was used.

    Never returns a silent zero score on API failure.
    """
    try:
        evaluation = await evaluate_answer(
            session_id=req.session_id,
            question_id=req.question_id,
            question_text=req.question_text,
            answer_text=req.answer_text,
            topic=req.topic,
            difficulty=req.difficulty,
            personality=req.personality or "friendly_mentor",
        )
        return EvaluateResponse(evaluation=evaluation, is_mock=evaluation.is_mock)
    except Exception as exc:
        logger.exception("Unexpected error during evaluation: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Evaluation service temporarily unavailable. Please try again.",
        )
