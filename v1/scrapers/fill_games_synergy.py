import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

"""
Main script to populate games table with 2024-25 season games from Synergy API

Flow:
1. Fetch games from Synergy API with pagination
2. Parse game data and create standardized game IDs
3. Check against existing games in DB to avoid duplicates
4. Add new games, linking them to teams

Game ID Format: WYYYYMMDDTM1TM2
- W: Women's game
- YYYYMMDD: Game date
- TM1: Home team short code
- TM2: Away team short code

Example: W20240214UBCOVIC (UBC vs Victoria on Feb 14, 2024)

Note: This assumes teams are already in the database with correct names.
The script handles:
- Matching team names between API and database
- Creating standardized game IDs
- Setting proper location and season format
- Converting team references to IDs

Run this when:
- Setting up initial game data
- Adding new games periodically
- Updating game results
"""

import requests
import json
from datetime import datetime
from v1.db.crud import create_game
from v1.db.models import Team, Game
from sqlalchemy.orm import Session
from v1.db.db import SessionLocal
from v1.constants.constants import team_names  # Import team constants
import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Configuration
SEASON_START_DATE = datetime(2024, 8, 1)  # August 1, 2024
GAMES_PER_REQUEST = 400

def get_team_info(db: Session, team_full_name: str) -> Dict[str, Any]:
    """Get team info including ID and short name"""
    # First try exact match
    team = db.query(Team).filter(Team.team_fullname == team_full_name).first()
    
    if not team:
        # Try partial match for known variations
        if team_full_name == "New Brunswick Reds":
            team = db.query(Team).filter(Team.team_fullname == "New Brunswick Varsity Reds").first()
        
        if not team:
            # Debug print to see what's in the database
            all_teams = db.query(Team).all()
            print(f"\nLooking for: {team_full_name}")
            print("Available teams in DB:")
            for t in all_teams:
                print(f"- {t.team_fullname}")
            raise ValueError(f"Team not found: {team_full_name}")
    
    # Find matching team in constants for additional info
    team_const = next((t for t in team_names if t['fullTeamName'] == team_full_name), None)
    if not team_const:
        # Try known variations in constants
        if team_full_name == "New Brunswick Reds":
            team_const = next((t for t in team_names if t['fullTeamName'] == "New Brunswick Varsity Reds"), None)
        
        if not team_const:
            raise ValueError(f"Team not found in constants: {team_full_name}")
        
    return {
        'id': team.team_id,
        'short': team_const['short'],
        'city': team_const['city']
    }

def parse_game_data(game_json: Dict[str, Any], db: Session) -> Dict[str, Any]:
    """Parse game JSON into database format"""
    # Get team info
    home_team = get_team_info(db, game_json['homeTeam']['fullName'])
    away_team = get_team_info(db, game_json['awayTeam']['fullName'])
    
    # Parse date for both game_id and date field
    game_date = datetime.strptime(game_json['localDate'][:10], '%Y-%m-%d')
    date_str = game_date.strftime('%Y%m%d')
    
    # Create game_id in format WYYYYMMDDTM1TM2
    game_id = f"W{date_str}{home_team['short']}{away_team['short']}"
    
    # Determine winner by ID
    winning_team_id = home_team['id'] if game_json['homeScore'] > game_json['awayScore'] else away_team['id']
    
    return {
        'game_id': game_id,
        'date': game_date,
        'season': '2024-25',  # Hardcoded as per requirement
        'location': home_team['city'],
        'team_one': home_team['id'],
        'team_two': away_team['id'],
        'team_one_score': game_json['homeScore'],
        'team_two_score': game_json['awayScore'],
        'winning_team': str(winning_team_id),  # Convert to string as per model
        'overtime': False,  # Need to determine this from phase data
        'comments': game_json.get('comment', '')
    }

def fetch_games():
    """Fetch games from Synergy API and save to database"""
    url = "https://basketball.synergysportstech.com/api/games"
    
    headers = {
        'authority': 'basketball.synergysportstech.com',
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'authorization': os.getenv('SYNERGY_TOKEN'),
        'content-type': 'application/json; charset=UTF-8',
        'origin': 'https://apps.synergysports.com',
        'referer': 'https://apps.synergysports.com/',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
        'x-synergy-client': 'ProductVersion=2025.02.13.5203; ProductName=Basketball.TeamSite'
    }
    
    payload = {
        "excludeGamesWithoutCompetition": True,
        "seasonIds": ["66c6294bac528f0cafb5ea59"],
        "competitionDefinitionKey": "54457dce300969b132fcfb38:CEE",
        "skip": 0,
        "take": GAMES_PER_REQUEST,
        "endDate": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "statuses": [4, 1, 2, 3, 5],
        "sort": "utc:desc",
        "conferenceIds": ["54457dcf300969b132fcfb7d"]
    }

    db = SessionLocal()
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        games_data = response.json()
        added_count = 0
        skipped_count = 0
        error_count = 0
        
        for game in games_data['result']:
            # Check game date
            game_date = datetime.strptime(game['localDate'][:10], '%Y-%m-%d')
            if game_date < SEASON_START_DATE:
                print(f"\nReached games before {SEASON_START_DATE.strftime('%Y-%m-%d')}, stopping.")
                break
                
            try:
                # First parse the game data to get our game_id format
                game_data = parse_game_data(game, db)
                
                # Check if game already exists
                existing_game = db.query(Game).filter(Game.game_id == game_data['game_id']).first()
                if existing_game:
                    print(f"Skipped existing game: {game_data['game_id']}")
                    skipped_count += 1
                    continue
                
                # Create new game
                create_game(db, game_data)
                print(f"Added game: {game_data['game_id']}")
                added_count += 1
                
            except Exception as e:
                print(f"Error processing game {game['id']}: {str(e)}")
                error_count += 1
                db.rollback()
                continue
        
        print(f"\nSummary:")
        print(f"Games processed: {len(games_data['result'])}")
        print(f"Games added: {added_count}")
        print(f"Games skipped: {skipped_count}")
        print(f"Errors: {error_count}")
                
    except Exception as e:
        print(f"Error fetching games: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fetch_games()
