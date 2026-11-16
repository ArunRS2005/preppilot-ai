"""
Session management endpoints.

In the current architecture, sessions are primarily persisted client-side
(localStorage / Supabase from frontend). These endpoints are available for
server-side persistence when Supabase is configured, but the app functions
fully without them.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query, status

from app.models.schemas import (
    CreateSessionRequest,
    SessionResponse,
    SessionStatus,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["sessions"])

# In-memory session store (used when Supabase is not configured)
# This is per-process and not shared across workers. For production, use Supabase.
_sessions: dict[str, dict] = {}


def _session_to_response(s: dict) -> SessionResponse:
    return SessionResponse(
        id=s["id"],
        user_id=s["user_id"],
        role=s["role"],
        topic=s["topic"],
        difficulty=s["difficulty"],
        interview_type=s["interview_type"],
        question_count=s["question_count"],
        status=s["status"],
        overall_score=s.get("overall_score"),
        created_at=s["created_at"],
        completed_at=s.get("completed_at"),
    )


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(req: CreateSessionRequest) -> SessionResponse:
    """Create a new interview session."""
    session_id = str(uuid4())
    session = {
        "id": session_id,
        "user_id": req.user_id,
        "role": req.role,
        "topic": req.topic,
        "difficulty": req.difficulty,
        "interview_type": req.interview_type,
        "question_count": req.question_count,
        "status": SessionStatus.in_progress,
        "overall_score": None,
        "created_at": datetime.now(timezone.utc),
        "completed_at": None,
    }
    _sessions[session_id] = session
    return _session_to_response(session)


@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions(
    user_id: str = Query(..., description="User ID to filter sessions"),
) -> List[SessionResponse]:
    """List all sessions for a user."""
    user_sessions = [s for s in _sessions.values() if s["user_id"] == user_id]
    user_sessions.sort(key=lambda s: s["created_at"], reverse=True)
    return [_session_to_response(s) for s in user_sessions]


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str) -> SessionResponse:
    """Get a single session by ID."""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return _session_to_response(session)


@router.post("/sessions/{session_id}/complete", response_model=SessionResponse)
async def complete_session(
    session_id: str,
    overall_score: Optional[int] = Query(None, ge=0, le=100),
) -> SessionResponse:
    """Mark a session as completed."""
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    session["status"] = SessionStatus.completed
    session["completed_at"] = datetime.now(timezone.utc)
    if overall_score is not None:
        session["overall_score"] = overall_score
    return _session_to_response(session)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: str) -> None:
    """Delete a session."""
    if session_id not in _sessions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    del _sessions[session_id]
