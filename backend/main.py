from flask import Flask, Blueprint, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import pandas as pd
from typing import List, Optional
from schemas import PitchSchema, PlayerSchema
from pathlib import Path

# Initialize Flask app and extensions
app = Flask(__name__)
CORS(app)

# Get the directory where main.py is located
BASE_DIR = Path(__file__).resolve().parent
print(f"Base directory: {BASE_DIR}")
DB_PATH = BASE_DIR / "data" / "baseball.db"
print(f"Using database path: {DB_PATH}")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
api_bp = Blueprint("api", __name__, url_prefix="/api")

# Database Models
class Player(db.Model):
    """SQLAlchemy model for player data."""

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
    """SQLAlchemy model for pitch data."""

    __tablename__ = "pitches"

    rowid = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # Pitch identification
    pitch_type = db.Column(db.String,  nullable=True)
    game_date = db.Column(db.String, nullable=False)

    # Pitcher and batter
    pitcher = db.Column(db.Integer, nullable=False)
    batter = db.Column(db.Integer, nullable=False)

    # Pitch characteristics
    release_speed = db.Column(db.String, nullable=True)
    release_spin_rate = db.Column(db.String, nullable=True)
    release_pos_x = db.Column(db.String, nullable=True)
    release_pos_z = db.Column(db.String, nullable=True)

    # Pitch location
    plate_x = db.Column(db.Float, nullable=True)
    plate_z = db.Column(db.Float, nullable=True)
    zone = db.Column(db.Integer, nullable=True)

    # Pitch result
    type = db.Column(db.String, nullable=True)  # S, B, X
    description = db.Column(db.String, nullable=True)
    events = db.Column(db.String, nullable=True)

    # Count and game situation
    balls = db.Column(db.Integer, nullable=True)
    strikes = db.Column(db.Integer, nullable=True)
    outs_when_up = db.Column(db.Integer, nullable=True)
    inning = db.Column(db.Integer, nullable=True)
    inning_topbot = db.Column(db.String, nullable=True)

    # Batted ball data
    launch_speed = db.Column(db.String, nullable=True)
    launch_angle = db.Column(db.String, nullable=True)
    hit_distance_sc = db.Column(db.String, nullable=True)

    # Player handedness
    stand = db.Column(db.String, nullable=True)  # L or R
    p_throws = db.Column(db.String, nullable=True)  # L or R

    # Teams
    home_team = db.Column(db.String, nullable=True)
    away_team = db.Column(db.String, nullable=True)


@api_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""

    return jsonify({"status": "healthy"}), 200


@api_bp.route("/players", methods=["GET"])
def get_players():
    """
    Get all players or filter by team/position.
    """

    q = Player.query
    team = request.args.get("team")
    position = request.args.get("position")

    if team:
        q = q.filter(Player.team == team)

    if position:
        q = q.filter(Player.primary_position == position)

    players_rows = q.all()
    schema = PlayerSchema(many=True)

    return jsonify(schema.dump(players_rows)), 200


@api_bp.route("/players/<int:player_id>", methods=["GET"])
def get_player(player_id):
    """
    Get players by id
    """
    
    player = db.session.get(Player, player_id)

    if player is None:
        return jsonify({"error": "Not found"}), 404

    return jsonify(PlayerSchema().dump(player)), 200


@api_bp.route("/pitches", methods=["GET"])
def get_pitches():
    """
    Get all pitches or filter by various fields such as player, team, date, etc.
    """

    q = Pitch.query
    pitcher_id = request.args.get("pitcher", type=int)
    batter_id = request.args.get("batter", type=int)
    min_speed = request.args.get("min_speed", type=float)

    if pitcher_id is not None:
        q = q.filter(Pitch.pitcher == pitcher_id)

    if batter_id is not None:
        q = q.filter(Pitch.batter == batter_id)

    if min_speed is not None:
        q = q.filter(cast(Pitch.release_speed, Float) >= min_speed)

    pitches = q.limit(10000).all()
    schema = PitchSchema(many=True)
    
    return jsonify(schema.dump(pitches)), 200


app.register_blueprint(api_bp)