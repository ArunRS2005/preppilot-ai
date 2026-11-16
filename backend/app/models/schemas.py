"""Pydantic schemas for request/response validation."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator


# ─── Enums ────────────────────────────────────────────────────────────────────

class TopicKey(str, Enum):
    java = "java"
    dsa = "dsa"
    dbms = "dbms"
    os = "os"
    networks = "networks"
    behavioral = "behavioral"


class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class InterviewType(str, Enum):
    technical = "technical"
    behavioral = "behavioral"
    mixed = "mixed"


class SessionStatus(str, Enum):
    in_progress = "in_progress"
    completed = "completed"
    abandoned = "abandoned"


# ─── Question ─────────────────────────────────────────────────────────────────

class Question(BaseModel):
    id: str
    topic: TopicKey
    type: InterviewType
    difficulty: Difficulty
    text: str
    follow_up: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    concepts: List[str] = Field(default_factory=list)


class QuestionsResponse(BaseModel):
    questions: List[Question]
    total: int


# ─── Evaluation request / response ────────────────────────────────────────────

class EvaluateRequest(BaseModel):
    session_id: str
    question_id: str
    question_text: str = Field(min_length=5, max_length=2000)
    answer_text: str = Field(min_length=1, max_length=10000)
    topic: TopicKey
    difficulty: Difficulty
    personality: Optional[str] = "friendly_mentor"


class EvaluationResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str
    question_id: str
    technical_score: int = Field(ge=0, le=100)
    completeness_score: int = Field(ge=0, le=100)
    clarity_score: int = Field(ge=0, le=100)
    overall_score: int = Field(ge=0, le=100)
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    demonstrated_concepts: List[str] = Field(default_factory=list)
    missing_concepts: List[str] = Field(default_factory=list)
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_mock: bool = False

    @field_validator("technical_score", "completeness_score", "clarity_score", "overall_score")
    @classmethod
    def validate_score(cls, v: int) -> int:
        if not isinstance(v, int):
            raise ValueError("Score must be an integer")
        return max(0, min(100, v))


class EvaluateResponse(BaseModel):
    evaluation: EvaluationResult
    is_mock: bool


# ─── Session ──────────────────────────────────────────────────────────────────

class CreateSessionRequest(BaseModel):
    user_id: str
    role: str = Field(min_length=1, max_length=100)
    topic: TopicKey
    difficulty: Difficulty
    interview_type: InterviewType
    question_count: int = Field(ge=1, le=20)


class SessionResponse(BaseModel):
    id: str
    user_id: str
    role: str
    topic: TopicKey
    difficulty: Difficulty
    interview_type: InterviewType
    question_count: int
    status: SessionStatus
    overall_score: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


# ─── Profile ──────────────────────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=200)
    target_role: Optional[str] = Field(None, max_length=100)
    experience_level: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    target_role: str
    experience_level: str
    updated_at: datetime


# ─── Health ───────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    gemini_available: bool
    supabase_available: bool
    environment: str


# ─── Error ────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
