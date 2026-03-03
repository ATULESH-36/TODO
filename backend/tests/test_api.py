import pytest
from app import app, init_db


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["DATABASE"] = ":memory:"

    with app.app_context():
        # Override global DATABASE variable safely
        from app import DATABASE
        import app as app_module
        app_module.DATABASE = ":memory:"
        init_db()

    with app.test_client() as client:
        yield client
