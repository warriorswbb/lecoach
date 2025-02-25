"""
Script to fill the play_by_play table with data from Synergy JSON files

Flow:
1. Reads play-by-play JSON files from output/pbp_data directory
2. Processes each play to extract direct values and calculate derived metrics
3. Matches plays to games in the database or creates placeholder games
4. Inserts processed plays into the play_by_play table

Key Features:
- Smart game matching using synergy_id, date+teams, or constructed game IDs
- JSON error recovery for malformed files
- Creation of placeholder games and teams when originals aren't found
- Extraction of detailed play information (players, teams, types, results)
- Calculation of game context (score, run tracking, lead changes)
- Tracking of momentum indicators (runs, lead changes, points per minute)
- Calculation of situational data (bonus, timeouts, possession metrics)
- Duplicate prevention by replacing existing plays
- Robust error handling to process all files even with some errors

Usage:
Run this script to populate the play_by_play table with all available play data.
The script will automatically find and process all JSON files in the data directory.

Dependencies:
- A properly configured database with games and teams tables
- JSON play-by-play files in the expected format
- Team constants for ID construction
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict
import logging
import uuid
from sqlalchemy import or_

sys.path.append(str(Path(__file__).parent.parent.parent))
from v1.db.db import SessionLocal
from v1.db.models import Game, PlayByPlay, Team
from v1.constants.constants import team_names

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add this at the module level to track missing game counter
_missing_game_counter = 0

def extract_play_type_result(play):
    """Extract play type and result from play items"""
    play_type = None
    play_result = None
    
    if 'items' in play and len(play['items']) >= 2:
        # First item after player is usually the play type
        for item in play['items']:
            if item.get('$type', '').endswith('PossessionPlayEvent, Synergy.Model.Api'):
                if play_type is None:
                    play_type = item.get('name')
                else:
                    play_result = item.get('name')
                    break
    
    return play_type, play_result

def process_game_file(file_path, insert_to_db=True):
    """Process a single game file and extract play-by-play data"""
    global _missing_game_counter
    logger.info(f"Processing file: {file_path}")
    
    try:
        with open(file_path, 'r') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error in {file_path}: {str(e)}")
                
                # Try to fix common JSON syntax errors
                with open(file_path, 'r') as repair_f:
                    content = repair_f.read()
                    
                try:
                    # Attempt to fix the JSON by adding closing braces or fixing common issues
                    fixed_content = attempt_json_repair(content, e)
                    if fixed_content:
                        data = json.loads(fixed_content)
                        logger.info(f"Successfully repaired JSON in {file_path}")
                    else:
                        logger.error(f"Could not repair JSON in {file_path}")
                        return 0
                except Exception as repair_e:
                    logger.error(f"Failed to repair JSON: {str(repair_e)}")
                    return 0
        
        # Check if data is in the expected format (direct array or nested under 'result')
        plays_data = data.get("result", data)
        
        # Game metadata from first play
        if not plays_data or len(plays_data) == 0:
            logger.warning(f"No plays found in {file_path}")
            return 0
        
        first_play = plays_data[0]
        synergy_game_id = first_play['game']['id']
        
        # Get team names and date for game matching
        home_team = first_play['game']['homeTeam']['name']
        away_team = first_play['game']['awayTeam']['name']
        
        try:
            game_date = datetime.strptime(first_play['game']['date'], '%Y-%m-%dT%H:%M:%SZ').date()
        except (ValueError, KeyError):
            # Try alternative date format if available
            try:
                game_date = datetime.strptime(first_play['game'].get('localDate', '')[:10], '%Y-%m-%d').date()
            except (ValueError, KeyError):
                logger.warning(f"Could not parse game date in {file_path}")
                game_date = None
                
        # Get our game_id that corresponds to this synergy_id
        db = SessionLocal()
        try:
            # Initialize game and game_id variables
            game = None
            game_id = None
            
            # First, try to find by synergy_id
            if synergy_game_id:
                game = db.query(Game).filter(Game.synergy_id == synergy_game_id).first()
                if game:
                    game_id = game.game_id
            
            # If not found by synergy_id, try to find by date and teams
            if not game and game_date:
                # Find games with matching date
                date_games = db.query(Game).filter(Game.date == game_date).all()
                
                # Try to match by team names
                for g in date_games:
                    try:
                        if ((g.team_one_rel and g.team_one_rel.team_name == home_team and 
                             g.team_two_rel and g.team_two_rel.team_name == away_team) or
                            (g.team_one_rel and g.team_one_rel.team_name == away_team and 
                             g.team_two_rel and g.team_two_rel.team_name == home_team)):
                            game = g
                            game_id = g.game_id
                            break
                    except AttributeError:
                        # Skip invalid game entry
                        continue
            
            # If still not found, try to construct potential game IDs
            if not game and game_date:
                potential_game_ids = construct_potential_game_ids(game_date, home_team, away_team)
                if potential_game_ids:
                    for potential_id in potential_game_ids:
                        game = db.query(Game).filter(Game.game_id == potential_id).first()
                        if game:
                            game_id = potential_id  # Set game_id to the found potential ID
                            logger.info(f"Found game by constructed ID: {potential_id}")
                            break
            
            if not game:
                # Generate a truly unique ID using synergy_id as part of it
                synergy_id_part = synergy_game_id[-6:] if synergy_game_id else str(_missing_game_counter)
                missing_id = f"MISSING_{synergy_id_part}"
                
                # Check if this missing ID already exists
                existing_missing = db.query(Game).filter(Game.game_id == missing_id).first()
                if existing_missing:
                    # If it exists, use that game and its ID
                    logger.info(f"Found existing placeholder game with ID {missing_id}")
                    game = existing_missing
                    game_id = missing_id
                else:
                    # Create new placeholder game
                    logger.warning(f"Game with synergy_id {synergy_game_id} not found in database. Creating placeholder: {missing_id}")
                    
                    # Determine team IDs - create proper team entries if needed
                    home_team_id = None
                    away_team_id = None
                    
                    # Extract complete team info from play data
                    home_team_info = extract_team_info(first_play['game']['homeTeam'])
                    away_team_info = extract_team_info(first_play['game']['awayTeam'])
                    
                    # Try to find team IDs from teams table
                    home_team_record = find_team_by_name(db, home_team)
                    away_team_record = find_team_by_name(db, away_team)
                    
                    # If teams not found, create them with proper info from JSON
                    if not home_team_record:
                        home_team_record = create_team_from_json(db, home_team_info)
                        if home_team_record:
                            logger.info(f"Created team: {home_team_info['fullName']}")
                            
                    if not away_team_record:
                        away_team_record = create_team_from_json(db, away_team_info)
                        if away_team_record:
                            logger.info(f"Created team: {away_team_info['fullName']}")
                    
                    # Now get the IDs
                    home_team_id = home_team_record.team_id if home_team_record else None
                    away_team_id = away_team_record.team_id if away_team_record else None
                    
                    # If we still don't have team IDs (rare), fall back to existing teams
                    if not home_team_id or not away_team_id:
                        fallback_teams = get_existing_team_ids(db)
                        home_team_id = home_team_id or fallback_teams[0]
                        away_team_id = away_team_id or fallback_teams[1]
                        logger.warning(f"Using fallback team IDs for game: {home_team_id}, {away_team_id}")
                    
                    # Create season string
                    if game_date:
                        year = game_date.year
                        season = f"{year}-{str(year+1)[-2:]}"
                    else:
                        season = "Unknown"
                        
                    # Create the game entry
                    try:
                        new_game = Game(
                            game_id=missing_id,
                            synergy_id=synergy_game_id,
                            date=game_date,
                            season=season,
                            location=home_team,  # Use home team name as location
                            team_one=home_team_id,
                            team_two=away_team_id,
                            team_one_score=0,
                            team_two_score=0,
                            winning_team="0",  # Assuming tie until scores are known
                            overtime=False,
                            comments=f"Placeholder game created from play-by-play data. Home: {home_team}, Away: {away_team}"
                        )
                        
                        db.add(new_game)
                        db.commit()
                        logger.info(f"Created placeholder game: {missing_id} ({home_team} vs {away_team})")
                        
                        # Use the new game_id
                        game_id = missing_id
                        game = new_game
                    except Exception as e:
                        logger.error(f"Error creating placeholder game: {str(e)}")
                        db.rollback()
                        return 0
            
            # Delete existing plays for this game to avoid duplicates
            if insert_to_db and game:
                deleted = db.query(PlayByPlay).filter(PlayByPlay.game_id == game_id).delete()
                if deleted > 0:
                    logger.info(f"Deleted {deleted} existing plays for game {game_id}")
                db.commit()
                
            home_team = first_play['game']['homeTeam']['name']
            away_team = first_play['game']['awayTeam']['name']
            
            # Track game state
            game_state = {
                'home_score': 0,
                'away_score': 0,
                'home_run': 0,
                'away_run': 0,
                'run_team': "home",  # Start with home team by default
                'run_points': 0,
                'lead_changes': 0,
                'largest_lead': 0,
                'prev_lead_team': None,
                'last_score_time': None,
                'possessions': 0,
                'last_minute_points': 0,
                'last_minute_possessions': 0,
                'plays_by_time': [],  # For tracking recent plays
                'fouls_by_period': defaultdict(lambda: {'home': 0, 'away': 0}),
                'timeouts': {'home': 5, 'away': 5},  # Default 5 timeouts per team
                'prev_play_type': None,
            }
            
            all_plays = []  # Store all processed plays
            
            # Add variables to track previous non-zero clock time
            last_non_zero_clock = 0
            
            # Process each play
            for play in plays_data:
                # Extract direct values
                play_id = play.get('id', str(uuid.uuid4()))
                period = play.get('period', 1)
                play_result = play.get('name', "None")
                
                # Clock time handling - always use previous non-zero time if current is 0
                clock_time = play.get('clock', 0)  # Seconds remaining in the period
                if clock_time == 0:
                    # Use the last non-zero clock time for any play with 0 clock
                    clock_time = last_non_zero_clock
                else:
                    last_non_zero_clock = clock_time
                
                time_remaining = clock_time

                # Duration is separate - it's how long the play took
                play_duration = play.get('duration', 0)  # in milliseconds
                is_home = play.get('ishome', False)
                
                # More robust UTC time parsing that handles formats with and without milliseconds
                utc_time = None
                if 'utc' in play:
                    utc_str = play.get('utc', '')
                    try:
                        # Try with milliseconds
                        utc_time = datetime.strptime(utc_str, "%Y-%m-%dT%H:%M:%S.%fZ")
                    except ValueError:
                        try:
                            # Try without milliseconds
                            utc_time = datetime.strptime(utc_str, "%Y-%m-%dT%H:%M:%SZ")
                        except ValueError:
                            logger.warning(f"Could not parse UTC time: {utc_str}")
                
                # Team and player info
                offense_team = play.get('offense', {}).get('name', '')
                defense_team = play.get('defense', {}).get('name', '')
                is_home_offense = offense_team == home_team
                
                offense_player = play.get('oplayer', {}).get('name', '')
                offense_player_id = play.get('oplayer', {}).get('id', '')
                result_player = play.get('rplayer', {}).get('name', '')
                result_player_id = play.get('rplayer', {}).get('id', '')
                
                # Play details
                description = play.get('description', '')
                play_result = play.get('name', '')
                if not play_result and ">" in description:
                    play_result = description.split(">")[-1].strip()
                tags = play.get('tags', [])
                play_number = play.get('plays', [0])[0] if play.get('plays') else None
                
                # Extract play type and result
                play_type, _ = extract_play_type_result(play)
                
                # Check if this is after a timeout
                after_timeout = play.get('ato', False) or 'Timeout' in description
                
                # Extract shot quality if available
                shot_quality = play.get('shotQuality')
                
                # Calculate game context
                # This would be more sophisticated in the real implementation
                seconds_remaining = (4 - period) * 600 + time_remaining  # Assuming 10 minute quarters
                game_percent_complete = (2400 - seconds_remaining) / 2400 * 100  # Total game is 40 minutes
                
                # For time_since_last_score, default to 0 at the start
                time_since_last = 0
                if game_state['last_score_time'] and utc_time:
                    delta = utc_time - game_state['last_score_time']
                    time_since_last = delta.total_seconds()
                
                # Explicitly set previous_play_type to None for first play
                previous_play_type = "None" if len(all_plays) == 0 else game_state['prev_play_type']
                
                # Create a data structure with the values we've extracted
                play_data = {
                    'id': play_id,
                    'game_id': game_id,
                    'period': period,
                    'clock_time': clock_time,
                    'time_remaining': time_remaining,
                    'utc_time': utc_time,
                    'offense_team': offense_team,
                    'defense_team': defense_team,
                    'is_home_offense': is_home_offense,
                    'offense_player': offense_player,
                    'offense_player_id': offense_player_id,
                    'result_player': result_player,
                    'result_player_id': result_player_id,
                    'play_type': play_type,
                    'play_result': play_result,
                    'description': description,
                    'tags': tags,
                    'play_number': play_number,
                    'is_home': is_home,
                    'after_timeout': after_timeout,
                    'shot_quality': shot_quality,
                    'home_score': game_state['home_score'],
                    'away_score': game_state['away_score'],
                    'run_team': game_state['run_team'],
                    'run_points': game_state['run_points'],
                    'home_run': game_state['home_run'],
                    'away_run': game_state['away_run'],
                    'score_margin': game_state['home_score'] - game_state['away_score'],
                    'leading_team': "home" if game_state['home_score'] > game_state['away_score'] else "away" if game_state['away_score'] > game_state['home_score'] else "tie",
                    'score_margin_percent': calculate_margin_percent(game_state),
                    'possession_number': game_state['possessions'],
                    'seconds_remaining': seconds_remaining,
                    'game_percent_complete': game_percent_complete,
                    'points_last_minute': game_state['last_minute_points'],
                    'possessions_last_minute': game_state['last_minute_possessions'],
                    'lead_changes': game_state['lead_changes'],
                    'largest_lead': game_state['largest_lead'],
                    'bonus': is_in_bonus(game_state, period, is_home_offense),
                    'double_bonus': is_in_double_bonus(game_state, period, is_home_offense),
                    'timeouts_remaining_home': game_state['timeouts']['home'],
                    'timeouts_remaining_away': game_state['timeouts']['away'],
                    'previous_play_type': previous_play_type,
                    'time_since_last_score': time_since_last
                }
                
                all_plays.append(play_data)
                
                # Update game state based on this play
                update_game_state(game_state, play_data, play)
            
            # Insert plays into database
            if insert_to_db and all_plays:
                inserted_count = 0
                for play in all_plays:
                    try:
                        # Create PlayByPlay object without the tags field
                        new_play = PlayByPlay(
                            id=play['id'],
                            game_id=play['game_id'],
                            period=play['period'],
                            clock_time=play['clock_time'],
                            time_remaining=play['time_remaining'],
                            utc_time=play['utc_time'],
                            offense_team=play['offense_team'],
                            defense_team=play['defense_team'],
                            is_home_offense=play['is_home_offense'],
                            offense_player=play['offense_player'],
                            offense_player_id=play['offense_player_id'],
                            result_player=play['result_player'],
                            result_player_id=play['result_player_id'],
                            play_type=play['play_type'],
                            play_result=play['play_result'],
                            description=play['description'],
                            play_number=play['play_number'],
                            is_home=play['is_home'],
                            after_timeout=play['after_timeout'],
                            shot_quality=play['shot_quality'],
                            home_score=play['home_score'],
                            away_score=play['away_score'],
                            run_team=play['run_team'],
                            run_points=play['run_points'],
                            home_run=play['home_run'],
                            away_run=play['away_run'],
                            score_margin=play['score_margin'],
                            score_margin_percent=play['score_margin_percent'],
                            possession_number=play['possession_number'],
                            seconds_remaining=play['seconds_remaining'],
                            game_percent_complete=play['game_percent_complete'],
                            points_last_minute=play['points_last_minute'],
                            possessions_last_minute=play['possessions_last_minute'],
                            lead_changes=play['lead_changes'],
                            largest_lead=play['largest_lead'],
                            bonus=play['bonus'],
                            double_bonus=play['double_bonus'],
                            timeouts_remaining_home=play['timeouts_remaining_home'],
                            timeouts_remaining_away=play['timeouts_remaining_away'],
                            previous_play_type=play['previous_play_type'],
                            time_since_last_score=play['time_since_last_score']
                        )
                        db.add(new_play)
                        inserted_count += 1
                        
                        # Commit in batches to avoid memory issues
                        if inserted_count % 100 == 0:
                            db.commit()
                            
                    except Exception as e:
                        logger.error(f"Error inserting play {play['id']}: {str(e)}")
                        db.rollback()
                
                # Final commit for any remaining plays
                db.commit()
                logger.info(f"Inserted {inserted_count} plays for game {game_id}")
                return inserted_count
                
        except Exception as e:
            logger.error(f"Error processing game file {file_path}: {str(e)}")
            db.rollback()
            return 0
        finally:
            db.close()
        
        if game:
            game_id = game.game_id
        else:
            # Create placeholder game logic
            return 0
        
        return 0
    except Exception as e:
        logger.error(f"Error processing game file {file_path}: {str(e)}")
        return 0

def update_game_state(state, play_data, raw_play):
    """Update game state based on current play"""
    # Track possession
    if (play_data['play_type'] in ['ISO', 'P&R Ball Handler', 'Post-Up', 'Spot-Up', 'Off Screen', 'Hand Off', 'Cut'] and 
        not state['prev_play_type'] in ['ISO', 'P&R Ball Handler', 'Post-Up', 'Spot-Up', 'Off Screen', 'Hand Off', 'Cut']):
        state['possessions'] += 1
    
    # Update previous play type
    state['prev_play_type'] = play_data['play_type']
    
    # Detect scoring plays
    scored_points = 0
    if "Make 2 Pts" in play_data['description']:
        scored_points = 2
    elif "Make 3 Pts" in play_data['description']:
        scored_points = 3
    elif "Free Throw" in play_data['description'] and any(x in raw_play for x in ['actualFtMade', 'ftmade']):
        scored_points = 1
    
    # Update score
    if scored_points > 0:
        if play_data['is_home']:
            state['home_score'] += scored_points
        else:
            state['away_score'] += scored_points
            
        # Update runs
        if play_data['is_home']:
            state['home_run'] += scored_points
            state['away_run'] = 0  # Reset opponent's run
            state['run_team'] = "home"
            state['run_points'] = state['home_run']
        else:
            state['away_run'] += scored_points
            state['home_run'] = 0  # Reset opponent's run
            state['run_team'] = "away"
            state['run_points'] = state['away_run']
        
        # Track lead changes
        current_lead = "home" if state['home_score'] > state['away_score'] else "away" if state['away_score'] > state['home_score'] else "tie"
        if state['prev_lead_team'] and current_lead != "tie" and state['prev_lead_team'] != current_lead:
            state['lead_changes'] += 1
        state['prev_lead_team'] = current_lead if current_lead != "tie" else state['prev_lead_team']
        
        # Track largest lead
        current_margin = abs(state['home_score'] - state['away_score'])
        if current_margin > state['largest_lead']:
            state['largest_lead'] = current_margin
        
        # Track last score time for time_since_last_score calculation
        state['last_score_time'] = play_data['utc_time']
        
        # Update points in last minute (if we have timestamp)
        if play_data['utc_time']:
            # Remove old plays from the last minute tracking
            current_time = play_data['utc_time']
            one_minute_ago = current_time - timedelta(seconds=60)
            
            # Add this play to the plays_by_time list
            state['plays_by_time'].append({
                'time': current_time,
                'points': scored_points,
                'is_possession': True
            })
            
            # Filter to keep only plays within the last minute
            state['plays_by_time'] = [p for p in state['plays_by_time'] if p['time'] > one_minute_ago]
            
            # Calculate points and possessions in the last minute
            state['last_minute_points'] = sum(p['points'] for p in state['plays_by_time'])
            state['last_minute_possessions'] = sum(1 for p in state['plays_by_time'] if p['is_possession'])
    
    # Handle timeouts
    if "Timeout" in play_data['description']:
        if "home" in play_data['description'].lower() or (play_data['is_home'] and "team" in play_data['description'].lower()):
            state['timeouts']['home'] = max(0, state['timeouts']['home'] - 1)
        elif "away" in play_data['description'].lower() or (not play_data['is_home'] and "team" in play_data['description'].lower()):
            state['timeouts']['away'] = max(0, state['timeouts']['away'] - 1)
    
    # Track fouls for bonus calculation
    if "Foul" in play_data['description']:
        period = play_data['period']
        if play_data['is_home_offense']:  # Defense committed the foul
            state['fouls_by_period'][period]['away'] += 1
        else:
            state['fouls_by_period'][period]['home'] += 1

def calculate_margin_percent(state):
    """Calculate score margin as percentage of total score"""
    total_score = state['home_score'] + state['away_score']
    if total_score == 0:
        return 0
    return ((state['home_score'] - state['away_score']) / total_score) * 100

def is_in_bonus(state, period, is_home_offense):
    """Determine if team is in bonus"""
    if period not in state['fouls_by_period']:
        return False
    
    # In NCAA, bonus after 7 team fouls
    defending_team = 'away' if is_home_offense else 'home'
    return state['fouls_by_period'][period][defending_team] >= 7

def is_in_double_bonus(state, period, is_home_offense):
    """Determine if team is in double bonus"""
    if period not in state['fouls_by_period']:
        return False
    
    # In NCAA, double bonus after 10 team fouls
    defending_team = 'away' if is_home_offense else 'home'
    return state['fouls_by_period'][period][defending_team] >= 10

def attempt_json_repair(content, error):
    """Attempt to repair common JSON syntax errors"""
    # Get error position
    line_no = error.lineno
    col_no = error.colno
    pos = error.pos
    
    if "Expecting ',' delimiter" in str(error):
        # Find the line with the error
        lines = content.split('\n')
        # Add a comma at the end of the previous line if needed
        if line_no > 1 and line_no <= len(lines):
            prev_line = lines[line_no - 2]  # -2 because zero-indexed and we want previous line
            if prev_line.strip().endswith('"') or prev_line.strip().endswith('}') or \
               prev_line.strip().endswith(']') or prev_line.strip().endswith("'") or \
               prev_line.strip().rstrip(',').isdigit():
                # Add comma if it's missing after a value
                if not prev_line.rstrip().endswith(','):
                    lines[line_no - 2] = prev_line.rstrip() + ','
                    return '\n'.join(lines)
    
    # For unclosed objects
    if pos == len(content) - 1:
        # Count opening and closing braces
        open_braces = content.count('{')
        close_braces = content.count('}')
        open_brackets = content.count('[')
        close_brackets = content.count(']')
        
        # Add missing closing braces/brackets
        missing_braces = open_braces - close_braces
        missing_brackets = open_brackets - close_brackets
        
        if missing_braces > 0 or missing_brackets > 0:
            fixed = content
            fixed += '}' * missing_braces
            fixed += ']' * missing_brackets
            return fixed
    
    # Alternative approach: skip the problematic section
    # This is more aggressive but can help with severely damaged files
    try:
        # Find the nearest valid JSON block by finding complete objects
        valid_part = content[:pos]
        
        # Find the last complete object
        last_complete = valid_part.rfind('}, {')
        if last_complete > 0:
            # Cut off at the last valid object and close the arrays/objects
            valid_part = valid_part[:last_complete+1]
            
            # Count unclosed braces and brackets up to this point
            open_braces = valid_part.count('{')
            close_braces = valid_part.count('}')
            open_brackets = valid_part.count('[')
            close_brackets = valid_part.count(']')
            
            # Close any unclosed structures
            valid_part += '}' * (open_braces - close_braces)
            valid_part += ']' * (open_brackets - close_brackets)
            
            # If we're in an array of objects, close it properly
            if '"result": [' in content[:1000]:  # Check beginning of file
                valid_part += "], \"errors\": []}"
                return valid_part
    except:
        pass
            
    # If all else fails
    return None

def construct_potential_game_ids(game_date, home_team, away_team):
    """Construct potential game IDs based on date and team names"""
    if not game_date:
        return []
    
    date_str = game_date.strftime('%Y%m%d')
    
    # Find team abbreviations from team_names constant
    home_abbr = None
    away_abbr = None
    
    for team in team_names:
        if team.get('teamName') == home_team or team.get('fullTeamName') == home_team:
            home_abbr = team.get('short')
        if team.get('teamName') == away_team or team.get('fullTeamName') == away_team:
            away_abbr = team.get('short')
    
    # If we can't find both abbreviations, return empty list
    if not home_abbr or not away_abbr:
        # Try one more time with fuzzy matching
        for team in team_names:
            if not home_abbr and (home_team in team.get('teamName', '') or home_team in team.get('fullTeamName', '')):
                home_abbr = team.get('short')
            if not away_abbr and (away_team in team.get('teamName', '') or away_team in team.get('fullTeamName', '')):
                away_abbr = team.get('short')
    
    # If still can't find both, return empty list
    if not home_abbr or not away_abbr:
        return []
    
    # Return both possible ID formats (home first then away, and vice versa)
    return [
        f"W{date_str}{home_abbr}{away_abbr}",
        f"W{date_str}{away_abbr}{home_abbr}"
    ]

def find_team_by_name(db, team_name):
    """Find a team by name with flexible matching"""
    # Try direct match first
    team = db.query(Team).filter(Team.team_name == team_name).first()
    
    # If not found, try with team_fullname
    if not team:
        team = db.query(Team).filter(Team.team_fullname == team_name).first()
    
    # If still not found, try partial match
    if not team:
        team = db.query(Team).filter(
            or_(
                Team.team_name.like(f"%{team_name}%"),
                Team.team_fullname.like(f"%{team_name}%")
            )
        ).first()
    
    # Special cases for known variations
    if not team and team_name == "New Brunswick":
        team = db.query(Team).filter(Team.team_fullname.like("%New Brunswick%")).first()
        
    return team

def get_fallback_team_ids(db):
    """Get two valid team IDs from existing teams"""
    teams = db.query(Team.team_id).limit(2).all()
    
    if len(teams) < 2:
        logger.error("Not enough teams in database for fallback IDs")
        return [1, 2]  # Last resort
    
    return [teams[0][0], teams[1][0]]

def extract_team_info(team_data):
    """Extract complete team info from JSON team data"""
    return {
        'name': team_data.get('name', ''),
        'abbr': team_data.get('abbr', ''),
        'fullName': team_data.get('fullName', ''),
        'conference': team_data.get('conference', {}).get('name', 'Unknown'),
        'division': team_data.get('division', {}).get('name', 'Unknown'),
    }

def create_team_from_json(db, team_info):
    """Create a proper team entry using JSON data"""
    try:
        # Create a proper team with the real info from JSON
        new_team = Team(
            team_city=team_info.get('fullName', '').split(' ')[0] if team_info.get('fullName') else "Unknown",
            team_name=team_info.get('name', ''),
            team_short=team_info.get('abbr', ''),
            team_school_name=team_info.get('fullName', ''),
            team_fullname=team_info.get('fullName', '')
        )
        db.add(new_team)
        db.flush()  # Get ID without committing
        db.commit()
        return new_team
    except Exception as e:
        logger.error(f"Error creating team {team_info.get('name')}: {str(e)}")
        db.rollback()
        return None

def get_existing_team_ids(db):
    """Get two valid team IDs from existing teams"""
    teams = db.query(Team.team_id).limit(2).all()
    
    if len(teams) < 2:
        logger.error("Not enough teams in database for fallback IDs")
        return [1, 2]  # Last resort
    
    return [teams[0][0], teams[1][0]]

def main():
    """Main function to run the play-by-play import"""
    pbp_data_dir = Path("../scripts/output/pbp_data")
    
    # Check if directory exists
    if not pbp_data_dir.exists():
        logger.error(f"Directory not found: {pbp_data_dir}")
        return
    
    # Get all JSON files in directory
    json_files = list(pbp_data_dir.glob("*.json"))
    logger.info(f"Found {len(json_files)} JSON files to process")
    
    total_plays = 0
    processed_files = 0
    skipped_files = []
    
    # Process each file
    for file_path in json_files:
        try:
            plays_inserted = process_game_file(file_path, insert_to_db=True)
            if plays_inserted > 0:
                total_plays += plays_inserted
                processed_files += 1
                
                # Log progress
                if processed_files % 10 == 0:
                    logger.info(f"Progress: Processed {processed_files} games with data, {len(skipped_files)} skipped")
            else:
                # If no plays were inserted, count as skipped
                skipped_files.append(str(file_path))
                
        except Exception as e:
            logger.error(f"Error processing {file_path}: {str(e)}")
            skipped_files.append(str(file_path))
            continue
    
    logger.info(f"Completed! Successfully processed {processed_files}/{len(json_files)} files with {total_plays} total plays inserted")
    
    if skipped_files:
        logger.warning(f"Skipped {len(skipped_files)} files due to errors or missing game data")
        if len(skipped_files) < 20:  # Only list if there aren't too many
            for f in skipped_files:
                logger.warning(f"  - {f}")
        else:
            logger.warning(f"  (too many skipped files to list)")

if __name__ == "__main__":
    main()
