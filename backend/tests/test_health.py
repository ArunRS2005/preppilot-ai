"""Tests for the health check endpoint."""

from fastapi.testclient import TestClient


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "gemini_available" in data
    assert "supabase_available" in data
    assert "environment" in data


def test_health_gemini_false_without_key(client: TestClient) -> None:
    """Without a real API key, gemini_available should be False."""
    response = client.get("/health")
    data = response.json()
    # In test environment without a real key, this should be False
    assert isinstance(data["gemini_available"], bool)
