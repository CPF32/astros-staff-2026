import os

import pytest

from main import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    baseball_db_path = os.path.join(os.path.dirname(__file__), "..", "data", "baseball.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{baseball_db_path}"

    with app.test_client() as client:
        with app.app_context():
            yield client


class TestHealthCheck:
    def test_health_check(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200
        assert res.get_json() == {"status": "healthy"}


class TestMetricsAPI:
    def test_metrics_endpoint(self, client):
        client.get("/api/health")
        res = client.get("/api/metrics")
        assert res.status_code == 200
        data = res.get_json()
        assert isinstance(data["requests_total"], int)
        assert isinstance(data["endpoint_counts"], dict)
        assert isinstance(data["status_counts"], dict)
        assert "last_request_ms" in data


class TestPlayerAPI:
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


class TestPitchAPI:
    def test_get_pitches_filtered_by_pitcher(self, client):
        res = client.get("/api/pitches", query_string={"pitcher": 477132})
        assert res.status_code == 200

        data = res.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert all(p["pitcher"] == 477132 for p in data)

    def test_get_pitches_filtered_by_batter(self, client):
        res = client.get("/api/pitches", query_string={"batter": 500743})
        assert res.status_code == 200

        data = res.get_json()
        assert len(data) >= 1
        assert all(p["batter"] == 500743 for p in data)

    def test_get_pitches_min_speed(self, client):
        res = client.get("/api/pitches", query_string={"min_speed": 95})
        assert res.status_code == 200

        data = res.get_json()
        assert isinstance(data, list)

        for p in data:
            speed = p.get("release_speed")
            assert speed is not None and float(speed) >= 95.0

    def test_get_pitches_by_game_date_and_pitch_type(self, client):
        res = client.get("/api/pitches", query_string={"game_date": "2025-11-01", "pitch_type": "SL"})
        assert res.status_code == 200

        data = res.get_json()
        assert isinstance(data, list)
        assert all(p["game_date"] == "2025-11-01" for p in data)
        assert all(p["pitch_type"] == "SL" for p in data)

    def test_get_pitches_max_speed(self, client):
        res = client.get("/api/pitches", query_string={"max_speed": 90})
        assert res.status_code == 200

        data = res.get_json()
        assert isinstance(data, list)
        for p in data:
            speed = p.get("release_speed")
            if speed is not None and speed != "":
                assert float(speed) <= 90.0
