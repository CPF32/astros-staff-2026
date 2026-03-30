from collections import Counter
from pathlib import Path
import logging
import time

from flask import Flask, Blueprint, jsonify, request, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Float, cast

from schemas import PitchSchema, PlayerSchema

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "data" / "baseball.db"
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

metrics = {
    "requests_total": 0,
    "endpoint_counts": Counter(),
    "status_counts": Counter(),
    "last_request_ms": 0.0,
}

db = SQLAlchemy(app)
api_bp = Blueprint("api", __name__, url_prefix="/api")


class Player(db.Model):
    __tablename__ = "players"

    player_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    birthdate = db.Column(db.String, nullable=False)
    birth_country = db.Column(db.String, nullable=True)
    birth_state = db.Column(db.String, nullable=True)
    height_feet = db.Column(db.Integer, nullable=False)
    height_inches = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Integer, nullable=False)
    team = db.Column(db.String(3), nullable=False)
    primary_position = db.Column(db.String, nullable=False)
    throws = db.Column(db.String(1), nullable=False)
    bats = db.Column(db.String(1), nullable=False)


class Pitch(db.Model):
    __tablename__ = "pitches"

    rowid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pitch_type = db.Column(db.String, nullable=True)
    game_date = db.Column(db.String, nullable=False)
    pitcher = db.Column(db.Integer, nullable=False)
    batter = db.Column(db.Integer, nullable=False)
    release_speed = db.Column(db.String, nullable=True)
    release_spin_rate = db.Column(db.String, nullable=True)
    release_pos_x = db.Column(db.String, nullable=True)
    release_pos_z = db.Column(db.String, nullable=True)
    plate_x = db.Column(db.Float, nullable=True)
    plate_z = db.Column(db.Float, nullable=True)
    zone = db.Column(db.Integer, nullable=True)
    type = db.Column(db.String, nullable=True)
    description = db.Column(db.String, nullable=True)
    events = db.Column(db.String, nullable=True)
    balls = db.Column(db.Integer, nullable=True)
    strikes = db.Column(db.Integer, nullable=True)
    outs_when_up = db.Column(db.Integer, nullable=True)
    inning = db.Column(db.Integer, nullable=True)
    inning_topbot = db.Column(db.String, nullable=True)
    launch_speed = db.Column(db.String, nullable=True)
    launch_angle = db.Column(db.String, nullable=True)
    hit_distance_sc = db.Column(db.String, nullable=True)
    stand = db.Column(db.String, nullable=True)
    p_throws = db.Column(db.String, nullable=True)
    home_team = db.Column(db.String, nullable=True)
    away_team = db.Column(db.String, nullable=True)


@app.before_request
def start_timer() -> None:
    g.request_start = time.perf_counter()


@app.after_request
def observe_request(response):
    if request.path.startswith("/api/"):
        elapsed = (time.perf_counter() - g.get("request_start", time.perf_counter())) * 1000
        metrics["requests_total"] += 1
        metrics["endpoint_counts"][request.path] += 1
        metrics["status_counts"][str(response.status_code)] += 1
        metrics["last_request_ms"] = round(elapsed, 2)
        app.logger.info("%s %s -> %s in %.2fms", request.method, request.path, response.status_code, elapsed)
    return response


@api_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200


@api_bp.route("/metrics", methods=["GET"])
def get_metrics():
    return (
        jsonify(
            {
                "requests_total": metrics["requests_total"],
                "endpoint_counts": dict(metrics["endpoint_counts"]),
                "status_counts": dict(metrics["status_counts"]),
                "last_request_ms": metrics["last_request_ms"],
            }
        ),
        200,
    )


@api_bp.route("/players", methods=["GET"])
def get_players():
    q = Player.query
    team = request.args.get("team")
    position = request.args.get("position")

    if team:
        q = q.filter(Player.team == team)
    if position:
        q = q.filter(Player.primary_position == position)

    players_rows = q.all()
    return jsonify(PlayerSchema(many=True).dump(players_rows)), 200


@api_bp.route("/players/<int:player_id>", methods=["GET"])
def get_player(player_id):
    player = db.session.get(Player, player_id)
    if player is None:
        return jsonify({"error": "Not found"}), 404
    return jsonify(PlayerSchema().dump(player)), 200


@api_bp.route("/pitches", methods=["GET"])
def get_pitches():
    q = Pitch.query
    pitcher_id = request.args.get("pitcher", type=int)
    batter_id = request.args.get("batter", type=int)
    game_date = request.args.get("game_date", type=str)
    pitch_type = request.args.get("pitch_type", type=str)
    min_speed = request.args.get("min_speed", type=float)
    max_speed = request.args.get("max_speed", type=float)
    min_release_pos_x = request.args.get("min_release_pos_x", type=float)
    max_release_pos_x = request.args.get("max_release_pos_x", type=float)
    min_release_pos_z = request.args.get("min_release_pos_z", type=float)
    max_release_pos_z = request.args.get("max_release_pos_z", type=float)
    min_spin_rate = request.args.get("min_spin_rate", type=float)
    max_spin_rate = request.args.get("max_spin_rate", type=float)

    if pitcher_id is not None:
        q = q.filter(Pitch.pitcher == pitcher_id)
    if batter_id is not None:
        q = q.filter(Pitch.batter == batter_id)
    if game_date:
        q = q.filter(Pitch.game_date == game_date)
    if pitch_type:
        q = q.filter(Pitch.pitch_type == pitch_type)
    if min_speed is not None:
        q = q.filter(cast(Pitch.release_speed, Float) >= min_speed)
    if max_speed is not None:
        q = q.filter(cast(Pitch.release_speed, Float) <= max_speed)

    if min_release_pos_x is not None:
        q = q.filter(cast(Pitch.release_pos_x, Float) >= min_release_pos_x)
    if max_release_pos_x is not None:
        q = q.filter(cast(Pitch.release_pos_x, Float) <= max_release_pos_x)
    if min_release_pos_z is not None:
        q = q.filter(cast(Pitch.release_pos_z, Float) >= min_release_pos_z)
    if max_release_pos_z is not None:
        q = q.filter(cast(Pitch.release_pos_z, Float) <= max_release_pos_z)

    if min_spin_rate is not None:
        q = q.filter(cast(Pitch.release_spin_rate, Float) >= min_spin_rate)
    if max_spin_rate is not None:
        q = q.filter(cast(Pitch.release_spin_rate, Float) <= max_spin_rate)

    pitches = q.limit(10000).all()
    return jsonify(PitchSchema(many=True).dump(pitches)), 200


app.register_blueprint(api_bp)
