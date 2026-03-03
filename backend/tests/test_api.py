import sys
import os
import pytest

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health(client):
    response = client.get("/api/tasks")
    assert response.status_code == 200


def test_create_task(client):
    response = client.post("/api/tasks", json={"title": "Test Task"})
    assert response.status_code == 201