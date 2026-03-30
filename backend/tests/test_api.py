import pytest
import os
import sys

from main import app, db, Player, Pitch


@pytest.fixture
def client():
    """Create a test client for the Flask application."""

    app.config["TESTING"] = True
    baseball_db_path = os.path.join(os.path.dirname(__file__), "..", "data", "baseball.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{baseball_db_path}"

    with app.test_client() as client:
        with app.app_context():
            yield client


class TestHealthCheck:
    """Test the health check endpoint."""

    def test_health_check(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200
        assert res.get_json() == {"status": "healthy"}


class TestPlayerAPI:
    """Test player-related API endpoints."""

    def test_get_all_players(self, client):
        res = client.get("/api/players")
        assert res.status_code == 200

        data = res.get_json()
        assert isinstance(data, list)
        assert len(data) >= 200
        assert "player_id" in data[0]
        assert "team" in data[0]
        assert "primary_position" in data[0]

    def test_filter_players_by_team(self, client):
        res = client.get("/api/players", query_string={"team": "LAD"})
        assert res.status_code == 200

        data = res.get_json()
        assert len(data) >= 1
        assert all(p["team"] == "LAD" for p in data)

    def test_filter_players_by_position(self, client):
        res = client.get("/api/players", query_string={"position": "SS"})
        assert res.status_code == 200

        data = res.get_json()
        assert len(data) >= 1
        assert all(p["primary_position"] == "SS" for p in data)

    def test_get_player_by_id(self, client):
        res = client.get("/api/players/500743")
        assert res.status_code == 200

        data = res.get_json()
        assert data["player_id"] == 500743
        assert data["team"] == "LAD"
        assert data["primary_position"] == "SS"

    def test_get_nonexistent_player(self, client):
        res = client.get("/api/players/999999999")
        assert res.status_code == 404
