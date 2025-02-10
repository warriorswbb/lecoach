from sqlalchemy.orm import Session
from . import models
from typing import Optional, List, Dict, Any

# Player operations
def get_player(db: Session, player_id: int) -> Optional[models.Player]:
    return db.query(models.Player).filter(models.Player.id == player_id).first()

def get_players(db: Session, skip: int = 0, limit: int = 100) -> List[models.Player]:
    return db.query(models.Player).offset(skip).limit(limit).all()

def create_player(db: Session, first_name: str, last_name: str, team_id: int) -> models.Player:
    player = models.Player(
        first_name=first_name,
        last_name=last_name,
        player_name=f"{first_name} {last_name}",
        team_id=team_id
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    return player

# Game operations
def get_game(db: Session, game_id: str) -> Optional[models.Game]:
    return db.query(models.Game).filter(models.Game.game_id == game_id).first()

def get_games_by_season(db: Session, season: str) -> List[models.Game]:
    return db.query(models.Game).filter(models.Game.season == season).all()

# Stats operations
def add_player_game_stats(db: Session, stats: Dict[str, Any]) -> models.PlayerGameStats:
    db_stats = models.PlayerGameStats(**stats)
    db.add(db_stats)
    db.commit()
    db.refresh(db_stats)
    return db_stats

def create_player_from_scrape(db: Session, player_data: dict) -> models.Player:
    """Create a player from scraped data"""
    # Get team_id from team_city
    team = db.query(models.Team).filter(models.Team.team_city == player_data['team_city']).first()
    if not team:
        raise ValueError(f"Team not found: {player_data['team_city']}")
    
    # Split name into components
    name_parts = player_data['name'].split()
    first_name = name_parts[0]
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
    
    # Create player
    player = models.Player(
        first_name=first_name,
        last_name=last_name,
        player_name=player_data['name'],
        team_id=team.team_id
    )
    
    db.add(player)
    db.commit()
    db.refresh(player)
    return player

def create_game(db: Session, game_data: Dict[str, Any]) -> models.Game:
    """Create a game from scraped data"""
    game = models.Game(**game_data)
    db.add(game)
    db.commit()
    db.refresh(game)
    return game 