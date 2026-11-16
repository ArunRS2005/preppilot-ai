"""Tests for the evaluation endpoint and evaluator service."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from app.services.evaluator import _mock_evaluate, _parse, _validate
from app.models.schemas import Difficulty, TopicKey


# ─── Mock evaluator unit tests ────────────────────────────────────────────────

def test_mock_evaluate_returns_valid_result() -> None:
    result = _mock_evaluate("s1", "q1", "A binary search tree is a sorted tree.", Difficulty.medium)
    assert 0 <= result.technical_score <= 100
    assert 0 <= result.completeness_score <= 100
    assert 0 <= result.clarity_score <= 100
    assert 0 <= result.overall_score <= 100
    assert result.is_mock is True
    assert isinstance(result.strengths, list)
    assert isinstance(result.improvements, list)


def test_mock_evaluate_scores_are_integers() -> None:
    result = _mock_evaluate("s1", "q1", "Some answer text here.", Difficulty.easy)
    assert isinstance(result.technical_score, int)
    assert isinstance(result.completeness_score, int)
    assert isinstance(result.clarity_score, int)
    assert isinstance(result.overall_score, int)


def test_mock_evaluate_empty_answer() -> None:
    """Mock evaluator should not crash on empty answer."""
    result = _mock_evaluate("s1", "q1", "", Difficulty.easy)
    assert result is not None
    assert 0 <= result.overall_score <= 100


def test_mock_evaluate_has_improvements() -> None:
    """Should always include at least one improvement."""
    result = _mock_evaluate("s1", "q1", "I don't know.", Difficulty.hard)
    assert len(result.improvements) >= 1


# ─── Response validation tests ────────────────────────────────────────────────

def test_validate_valid_data() -> None:
    data = {
        "technical_score": 75,
        "completeness_score": 80,
        "clarity_score": 70,
        "overall_score": 75,
        "strengths": ["Good explanation"],
        "improvements": ["Add examples"],
        "demonstrated_concepts": ["binary search"],
        "missing_concepts": ["complexity analysis"],
    }
    result = _validate(data)
    assert result["technical_score"] == 75
    assert result["strengths"] == ["Good explanation"]


def test_validate_clamps_scores() -> None:
    data = {
        "technical_score": 110,   # over 100
        "completeness_score": -5,  # below 0
        "clarity_score": 50,
        "overall_score": 150,
        "strengths": [],
        "improvements": ["test"],
        "demonstrated_concepts": [],
        "missing_concepts": [],
    }
    # Should raise ValueError for out-of-range scores
    with pytest.raises(ValueError):
        _validate(data)


def test_validate_missing_fields() -> None:
    with pytest.raises(ValueError, match="Missing fields"):
        _validate({"technical_score": 75})


def test_parse_valid_json() -> None:
    json_str = '''{
        "technical_score": 80,
        "completeness_score": 75,
        "clarity_score": 85,
        "overall_score": 80,
        "strengths": ["Clear explanation"],
        "improvements": ["Add examples"],
        "demonstrated_concepts": ["OOP"],
        "missing_concepts": ["interfaces"]
    }'''
    result = _parse(json_str)
    assert result["technical_score"] == 80
    assert result["overall_score"] == 80


def test_parse_strips_markdown() -> None:
    json_str = '''```json
    {
        "technical_score": 70,
        "completeness_score": 65,
        "clarity_score": 75,
        "overall_score": 70,
        "strengths": [],
        "improvements": ["Be more specific"],
        "demonstrated_concepts": [],
        "missing_concepts": []
    }
    ```'''
    result = _parse(json_str)
    assert result["technical_score"] == 70


def test_parse_invalid_json() -> None:
    with pytest.raises(ValueError, match="invalid JSON"):
        _parse("not json at all {{{")


# ─── API endpoint tests ───────────────────────────────────────────────────────

def test_evaluate_endpoint_mock_mode(client: TestClient) -> None:
    """Evaluation endpoint should work in mock mode (no real Gemini key in tests)."""
    response = client.post("/api/evaluate", json={
        "session_id": "test-session",
        "question_id": "java-001",
        "question_text": "What is OOP?",
        "answer_text": "OOP stands for Object-Oriented Programming with four principles.",
        "topic": "java",
        "difficulty": "easy",
    })
    assert response.status_code == 200
    data = response.json()
    assert "evaluation" in data
    assert "is_mock" in data
    ev = data["evaluation"]
    assert 0 <= ev["overall_score"] <= 100
    assert 0 <= ev["technical_score"] <= 100


def test_evaluate_endpoint_empty_answer(client: TestClient) -> None:
    """Empty answer should fail validation."""
    response = client.post("/api/evaluate", json={
        "session_id": "s1",
        "question_id": "q1",
        "question_text": "What is OOP?",
        "answer_text": "",
        "topic": "java",
        "difficulty": "easy",
    })
    assert response.status_code == 422


def test_evaluate_endpoint_invalid_topic(client: TestClient) -> None:
    response = client.post("/api/evaluate", json={
        "session_id": "s1",
        "question_id": "q1",
        "question_text": "What is OOP?",
        "answer_text": "Some answer",
        "topic": "invalid_topic",
        "difficulty": "easy",
    })
    assert response.status_code == 422


def test_evaluate_endpoint_score_range(client: TestClient) -> None:
    """All scores must be in [0, 100]."""
    response = client.post("/api/evaluate", json={
        "session_id": "s1",
        "question_id": "q1",
        "question_text": "Explain ACID properties in detail with examples.",
        "answer_text": "ACID stands for Atomicity, Consistency, Isolation, and Durability. "
                       "These are properties of database transactions that ensure data integrity.",
        "topic": "dbms",
        "difficulty": "medium",
    })
    assert response.status_code == 200
    ev = response.json()["evaluation"]
    for field in ["technical_score", "completeness_score", "clarity_score", "overall_score"]:
        assert 0 <= ev[field] <= 100, f"{field} out of range: {ev[field]}"
