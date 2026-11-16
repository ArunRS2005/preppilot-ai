from typing import Optional
from fastapi import APIRouter, Query
from app.models.schemas import Difficulty, InterviewType, QuestionsResponse, TopicKey
from app.services.questions import get_questions

router = APIRouter(prefix="/api", tags=["questions"])


@router.get("/questions", response_model=QuestionsResponse)
async def list_questions(
    topic: Optional[TopicKey] = Query(None, description="Filter by topic"),
    difficulty: Optional[Difficulty] = Query(None, description="Filter by difficulty"),
    type: Optional[InterviewType] = Query(None, description="Filter by interview type"),
    count: Optional[int] = Query(None, ge=1, le=20, description="Number of questions to return"),
) -> QuestionsResponse:
    """Return questions from the question bank, optionally filtered."""
    questions = get_questions(
        topic=topic,
        difficulty=difficulty,
        interview_type=type,
        count=count,
    )
    return QuestionsResponse(questions=questions, total=len(questions))
