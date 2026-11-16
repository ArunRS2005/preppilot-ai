"""Tests for question endpoints and services."""

import pytest
from fastapi.testclient import TestClient

from app.services.questions import get_questions, get_question_by_id, QUESTION_BANK
from app.models.schemas import Difficulty, InterviewType, TopicKey


def test_get_questions_no_filter(client: TestClient) -> None:
    response = client.get("/api/questions")
    assert response.status_code == 200
    data = response.json()
    assert "questions" in data
    assert "total" in data
    assert data["total"] > 0
    assert len(data["questions"]) == data["total"]


def test_get_questions_filtered_by_topic(client: TestClient) -> None:
    response = client.get("/api/questions?topic=java")
    assert response.status_code == 200
    data = response.json()
    assert all(q["topic"] == "java" for q in data["questions"])


def test_get_questions_filtered_by_difficulty(client: TestClient) -> None:
    response = client.get("/api/questions?difficulty=easy")
    assert response.status_code == 200
    data = response.json()
    assert all(q["difficulty"] == "easy" for q in data["questions"])


def test_get_questions_count_limit(client: TestClient) -> None:
    response = client.get("/api/questions?count=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) <= 3


def test_get_questions_invalid_topic(client: TestClient) -> None:
    response = client.get("/api/questions?topic=invalid_topic")
    assert response.status_code == 422  # Validation error


def test_get_questions_count_out_of_range(client: TestClient) -> None:
    response = client.get("/api/questions?count=0")
    assert response.status_code == 422


# ─── Service unit tests ───────────────────────────────────────────────────────

def test_question_bank_not_empty() -> None:
    assert len(QUESTION_BANK) > 0


def test_all_topics_represented() -> None:
    topics = {q.topic for q in QUESTION_BANK}
    for topic in TopicKey:
        assert topic in topics, f"Topic {topic} missing from question bank"


def test_get_questions_service_topic_filter() -> None:
    questions = get_questions(topic=TopicKey.java)
    assert all(q.topic == TopicKey.java for q in questions)


def test_get_questions_service_count() -> None:
    questions = get_questions(count=3)
    assert len(questions) <= 3


def test_get_question_by_id_exists() -> None:
    q = get_question_by_id("java-001")
    assert q is not None
    assert q.id == "java-001"


def test_get_question_by_id_missing() -> None:
    q = get_question_by_id("nonexistent-999")
    assert q is None
