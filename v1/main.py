from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from db.db import get_db
from db.models import Base, Team, Player, Game, PlayerGameStats, TeamGameStats
from db.db import engine
from typing import List
from sqlalchemy import text, desc

# Create the FastAPI app
app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Test database connection using text()
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}

@app.get("/teams", response_model=List[dict])
def get_teams(db: Session = Depends(get_db)):
    """Get all teams"""
    teams = db.query(Team).all()
    return [
        {
            "team_id": team.team_id,
            "team_name": team.team_name,
            "team_city": team.team_city,
            "team_short": team.team_short,
            "team_fullname": team.team_fullname
        }
        for team in teams
    ]

@app.get("/teams/{team_id}")
def get_team(team_id: int, db: Session = Depends(get_db)):
    """Get team by ID"""
    team = db.query(Team).filter(Team.team_id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return {
        "team_id": team.team_id,
        "team_name": team.team_name,
        "team_city": team.team_city,
        "team_short": team.team_short,
        "team_fullname": team.team_fullname,
        "players": [
            {
                "id": player.id,
                "name": player.player_name
            }
            for player in team.players
        ]
    }

@app.get("/players", response_model=List[dict])
def get_players(db: Session = Depends(get_db)):
    """Get all players"""
    players = db.query(Player).all()
    return [
        {
            "id": player.id,
            "name": player.player_name,
            "team": player.team.team_name if player.team else None
        }
        for player in players
    ]

@app.get("/players/{player_id}")
def get_player(player_id: int, db: Session = Depends(get_db)):
    """Get player by ID with their game stats"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Get recent game stats
    recent_stats = (
        db.query(PlayerGameStats)
        .filter(PlayerGameStats.player_id == player_id)
        .order_by(desc(Game.date))
        .limit(5)
        .all()
    )
    
    return {
        "id": player.id,
        "name": player.player_name,
        "team": player.team.team_name if player.team else None,
        "recent_games": [
            {
                "game_id": stat.game_id,
                "points": stat.points,
                "rebounds": stat.reb,
                "assists": stat.assist
            }
            for stat in recent_stats
        ]
    }

@app.get("/games", response_model=List[dict])
def get_games(limit: int = 10, db: Session = Depends(get_db)):
    """Get recent games"""
    games = db.query(Game).order_by(desc(Game.date)).limit(limit).all()
    return [
        {
            "game_id": game.game_id,
            "date": game.date,
            "team_one": game.team_one_rel.team_name,
            "team_two": game.team_two_rel.team_name,
            "team_one_score": game.team_one_score,
            "team_two_score": game.team_two_score,
            "location": game.location
        }
        for game in games
    ]

@app.get("/games/{game_id}")
def get_game(game_id: str, db: Session = Depends(get_db)):
    """Get detailed game information"""
    game = db.query(Game).filter(Game.game_id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return {
        "game_id": game.game_id,
        "date": game.date,
        "season": game.season,
        "location": game.location,
        "team_one": {
            "name": game.team_one_rel.team_name,
            "score": game.team_one_score,
            "stats": game.team_one_stats.dict() if game.team_one_stats else None
        },
        "team_two": {
            "name": game.team_two_rel.team_name,
            "score": game.team_two_score,
            "stats": game.team_two_stats.dict() if game.team_two_stats else None
        },
        "winning_team": game.winning_team,
        "overtime": game.overtime
    } 