import pytest
import app as app_module


@pytest.fixture
def client():
    app_module.app.config["TESTING"] = True
    app_module.DATABASE = ":memory:"

    with app_module.app.app_context():
        app_module.init_db()

    with app_module.app.test_client() as client:
        yield client


def test_health(client):
    response = client.get("/api/tasks")
    assert response.status_code == 200


def test_create_task(client):
    response = client.post("/api/tasks", json={"title": "Test Task"})
    assert response.status_code == 201
