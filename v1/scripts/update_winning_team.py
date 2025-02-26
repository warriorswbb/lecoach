from sqlalchemy import create_engine, text, func, desc
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging
from tqdm import tqdm
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import models
from db.models import PlayByPlay, Game

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_winning_teams():
    # Load environment variables
    load_dotenv()
    
    # Get database URL based on environment
    DB_ENVIRONMENT = os.getenv('DB_ENVIRONMENT', 'LOCAL')
    if DB_ENVIRONMENT == 'DOCKER':
        DATABASE_URL = os.getenv('DOCKER_DATABASE_URL')
    elif DB_ENVIRONMENT == 'PROD':
        raw_url = os.getenv('PROD_DATABASE_URL')
        DB_PASSWORD = os.getenv('PROD_DB_PASSWORD')
        DATABASE_URL = raw_url.replace('${PROD_DB_PASSWORD}', DB_PASSWORD)
    else:
        DATABASE_URL = os.getenv('LOCAL_DATABASE_URL')
    
    # Create engine and session
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Get all distinct game_ids from play_by_play
        game_ids_query = session.query(PlayByPlay.game_id).distinct().all()
        game_ids = [g[0] for g in game_ids_query]
        
        logger.info(f"Found {len(game_ids)} games to process")
        
        # Process each game
        for game_id in tqdm(game_ids, desc="Processing games"):
            # Find the last play of the game (highest period, lowest time_remaining)
            last_play = (session.query(PlayByPlay)
                        .filter(PlayByPlay.game_id == game_id)
                        .order_by(desc(PlayByPlay.period), PlayByPlay.time_remaining)
                        .first())
            
            if not last_play:
                logger.warning(f"No plays found for game {game_id}")
                continue
            
            # Get the home and away team names directly from the play-by-play data
            # This ensures we use the same naming convention as in the play-by-play table
            first_play = (session.query(PlayByPlay)
                         .filter(PlayByPlay.game_id == game_id)
                         .order_by(PlayByPlay.period, desc(PlayByPlay.time_remaining))
                         .first())
                         
            if not first_play:
                logger.warning(f"No plays found for game {game_id}")
                continue
                
            # Determine home and away teams from the first play
            home_team = None
            away_team = None
            
            if first_play.is_home_offense:
                home_team = first_play.offense_team
                away_team = first_play.defense_team
            else:
                home_team = first_play.defense_team
                away_team = first_play.offense_team
            
            # Double-check by looking at a few more plays if needed
            if not home_team or not away_team:
                # Get a few more plays to determine teams
                sample_plays = (session.query(PlayByPlay)
                              .filter(PlayByPlay.game_id == game_id)
                              .order_by(PlayByPlay.period, desc(PlayByPlay.time_remaining))
                              .limit(10)
                              .all())
                              
                for play in sample_plays:
                    if play.is_home_offense and not home_team:
                        home_team = play.offense_team
                    elif play.is_home_offense and not away_team:
                        away_team = play.defense_team
                    elif not play.is_home_offense and not away_team:
                        away_team = play.offense_team
                    elif not play.is_home_offense and not home_team:
                        home_team = play.defense_team
                        
                    if home_team and away_team:
                        break
            
            # Determine winning team based on score
            if last_play.home_score > last_play.away_score:
                winning_team = home_team
            elif last_play.away_score > last_play.home_score:
                winning_team = away_team
            else:
                winning_team = "Tie"
            
            logger.info(f"Game {game_id}: {winning_team} wins ({last_play.home_score}-{last_play.away_score})")
            
            # Update all plays for this game
            session.execute(
                text("UPDATE play_by_play SET winning_team = :team WHERE game_id = :game_id"),
                {"team": winning_team, "game_id": game_id}
            )
            
            # Also update the game record if it exists
            game = session.query(Game).filter(Game.game_id == game_id).first()
            if game:
                # Update game scores and winning team
                game.team_one_score = last_play.home_score
                game.team_two_score = last_play.away_score
                game.winning_team = winning_team
                session.add(game)
            
            # Commit after each game to avoid long transactions
            session.commit()
        
        logger.info("Successfully updated winning_team for all play-by-play records")
        
    except Exception as e:
        logger.error(f"Error updating winning teams: {str(e)}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    update_winning_teams() 