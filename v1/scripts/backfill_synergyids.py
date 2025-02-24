"""
Script to backfill Synergy IDs into existing games table

Flow:
1. Adds synergy_id column to games table if it doesn't exist
2. Reads Synergy game IDs from ids.csv
3. Matches games based on date and team combinations
4. Updates matched games with their Synergy ID
5. Outputs unmatched games to unmatched_games.csv for debugging

The script matches games by:
- Game date
- Home and away team combinations (checks both team_one/team_two orders)

Output:
- Updates games table with synergy_id for matched games
- Creates unmatched_games.csv with details of games that couldn't be matched

Run this when:
- Initially linking existing games to Synergy IDs
- After adding new games to verify all have Synergy IDs
- Debugging missing play-by-play data
"""

import csv
from datetime import datetime
import logging
from sqlalchemy import Column, String
from sqlalchemy.sql import text
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent.parent))

from v1.db.db import engine, Base, SessionLocal
from v1.db.models import Game
from v1.constants.team_ids import team_ids
from v1.constants.constants import team_names

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_synergy_id_column():
    """Add synergy_id column to games table if it doesn't exist"""
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='games' AND column_name='synergy_id'
        """))
        
        if not result.fetchone():
            conn.execute(text("ALTER TABLE games ADD COLUMN synergy_id VARCHAR(255)"))
            logger.info("Added synergy_id column to games table")

def get_team_lookup():
    """Create lookup dictionaries for team names"""
    # Create lookup from full team name to team_id
    name_to_id = {}
    for team in team_names:
        name_to_id[team["fullTeamName"]] = team_ids[team["city"]]
    return name_to_id

def parse_date(date_str):
    """Parse date string from CSV to datetime object"""
    return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ").date()

def match_games():
    """Match Synergy IDs with games in database"""
    name_to_id = get_team_lookup()
    unmatched = []
    matched_count = 0
    
    # Read CSV file
    with open('output/ids.csv', 'r') as f:
        reader = csv.DictReader(f)
        games = list(reader)
    
    db = SessionLocal()
    try:
        for game in games:
            # Get team IDs
            home_team_id = name_to_id.get(game['Home Team'])
            away_team_id = name_to_id.get(game['Away Team'])
            game_date = parse_date(game['UTC Date'])
            
            if not home_team_id or not away_team_id:
                unmatched.append({
                    'synergy_id': game['Game ID'],
                    'reason': 'Team name not found in lookup',
                    'details': game
                })
                continue
            
            # Try to find matching game in database
            db_game = db.query(Game).filter(
                Game.date == game_date,
                ((Game.team_one == home_team_id) & (Game.team_two == away_team_id) |
                 (Game.team_one == away_team_id) & (Game.team_two == home_team_id))
            ).first()
            
            if db_game:
                db_game.synergy_id = game['Game ID']
                matched_count += 1
            else:
                unmatched.append({
                    'synergy_id': game['Game ID'],
                    'reason': 'No matching game found in database',
                    'details': game
                })
        
        db.commit()
        logger.info(f"Successfully matched {matched_count} games")
        
        # Write unmatched games to file
        if unmatched:
            with open('output/unmatched_games.csv', 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=['synergy_id', 'reason', 'details'])
                writer.writeheader()
                writer.writerows(unmatched)
            logger.warning(f"Found {len(unmatched)} unmatched games. See unmatched_games.csv")
            
    except Exception as e:
        logger.error(f"Error matching games: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def main():
    """Main function to run the backfill script"""
    try:
        # Add synergy_id column
        add_synergy_id_column()
        
        # Match and update games
        match_games()
        
    except Exception as e:
        logger.error(f"Error in backfill script: {str(e)}")
        raise

if __name__ == "__main__":
    main()
