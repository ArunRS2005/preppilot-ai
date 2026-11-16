"""Tests for session management endpoints."""

from fastapi.testclient import TestClient


def _create_session(client: TestClient) -> dict:
    response = client.post("/api/sessions", json={
        "user_id": "test-user-1",
        "role": "Software Engineer",
        "topic": "java",
        "difficulty": "medium",
        "interview_type": "technical",
        "question_count": 3,
    })
    assert response.status_code == 201
    return response.json()


def test_create_session(client: TestClient) -> None:
    session = _create_session(client)
    assert session["status"] == "in_progress"
    assert session["topic"] == "java"
    assert session["difficulty"] == "medium"
    assert session["overall_score"] is None
    assert "id" in session


def test_list_sessions(client: TestClient) -> None:
    _create_session(client)
    response = client.get("/api/sessions?user_id=test-user-1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_session(client: TestClient) -> None:
    session = _create_session(client)
    session_id = session["id"]
    response = client.get(f"/api/sessions/{session_id}")
    assert response.status_code == 200
    assert response.json()["id"] == session_id


def test_get_nonexistent_session(client: TestClient) -> None:
    response = client.get("/api/sessions/nonexistent-id")
    assert response.status_code == 404


def test_complete_session(client: TestClient) -> None:
    session = _create_session(client)
    session_id = session["id"]
    response = client.post(f"/api/sessions/{session_id}/complete?overall_score=75")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["overall_score"] == 75
    assert data["completed_at"] is not None


def test_delete_session(client: TestClient) -> None:
    session = _create_session(client)
    session_id = session["id"]
    response = client.delete(f"/api/sessions/{session_id}")
    assert response.status_code == 204
    # Should 404 now
    response = client.get(f"/api/sessions/{session_id}")
    assert response.status_code == 404


def test_create_session_validation(client: TestClient) -> None:
    """Empty role should fail validation."""
    response = client.post("/api/sessions", json={
        "user_id": "u1",
        "role": "",
        "topic": "java",
        "difficulty": "medium",
        "interview_type": "technical",
        "question_count": 3,
    })
    assert response.status_code == 422


def test_create_session_invalid_question_count(client: TestClient) -> None:
    response = client.post("/api/sessions", json={
        "user_id": "u1",
        "role": "Engineer",
        "topic": "java",
        "difficulty": "medium",
        "interview_type": "technical",
        "question_count": 0,  # below minimum
    })
    assert response.status_code == 422
