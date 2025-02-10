import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

import requests
from bs4 import BeautifulSoup
from datetime import datetime
from v1.constants.constants import team_names
from v1.constants.team_ids import team_ids  # Generated from script above
from v1.db.db import SessionLocal
from v1.db import crud

def parse_game_id(stats_link: str) -> str:
    """Extract game ID from stats link URL"""
    if not stats_link:
        return None
    # Example URL: /history/show-game-report.php?Gender=WBB&Season=2024-25&Gameid=W20241005BRKUBC
    if 'Gameid=' in stats_link:
        return stats_link.split('Gameid=')[-1]
    return None

def get_games_from_team_page(team_city: str) -> list:
    """
    Scrapes game data from a team's season page
    Returns list of game dicts with raw team names
    """
    url = f"https://usportshoops.ca/history/teamseason.php?Gender=WBB&Season=2024-25&Team={team_city}"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    games = []
    # Find the text "Game results for the season" inside a <b> tag
    game_header = soup.find('b', string='Game results for the season')
    if not game_header:
        print(f"No game results section found for {team_city}")
        return []
        
    # Get the next table after this text
    results_table = game_header.find_next('table')
    if not results_table:
        print(f"No results table found for {team_city}")
        return []
    
    # Process each row in the table
    for row in results_table.find_all('tr'):
        cols = row.find_all('td')
        if len(cols) < 6:  # Need at least date, location, opponent, result, score, stats
            continue
            
        # Skip rows that don't have game data
        if not cols[0].text.strip() or "Date" in cols[0].text:  # Skip empty rows and headers
            continue
            
        # Find stats link if it exists
        stats_link = cols[5].find('a')
        if not stats_link or not stats_link.get('href'):
            continue
            
        game_id = parse_game_id(stats_link['href'])
        if not game_id:
            continue
        
        # Get result and score
        result = cols[3].text.strip()
        
        # Get score - it's the text content before the "Stats" link
        score_col = cols[4]
        score_text = score_col.get_text().split('Stats')[0].strip()  # Get text before "Stats"
        
        try:
            team_score, opp_score = map(int, score_text.split('-'))
            # Swap scores if it was a Loss
            if result == "Loss":
                team_score, opp_score = opp_score, team_score
            
            game = {
                'game_id': game_id,
                'date': datetime.strptime(cols[0].text.strip(), '%a %b %d, %Y').date(),
                'location': cols[1].text.strip(),
                'opponent': cols[2].text.strip(),
                'team_score': team_score,
                'opponent_score': opp_score,
                'team_city': team_city,
                'result': result
            }
            games.append(game)
        except ValueError as e:
            print(f"Error parsing score '{score_text}': {str(e)}")
            continue
    
    return games

def main():
    """Test run to print games before adding to database"""
    # Test with one team first
    print("\nTesting with Brock...")
    games = get_games_from_team_page("Brock")
    
    print(f"\nFound {len(games)} games:")
    for game in games:
        print(f"\nGame ID: {game['game_id']}")
        print(f"  Date: {game['date']}")
        print(f"  Location: {game['location']}")
        print(f"  Teams: {game['team_city']} ({game['result']}) vs {game['opponent']}")
        print(f"  Score: {game['team_score']}-{game['opponent_score']}")
    
    # If the output looks good, uncomment to process all teams
    '''
    all_games = []
    for team in team_names:
        print(f"\nProcessing {team['city']}...")
        team_games = get_games_from_team_page(team['city'])
        print(f"Found {len(team_games)} games")
        all_games.extend(team_games)
    
    print(f"\nTotal games found: {len(all_games)}")
    print("\nSample of games found:")
    for game in all_games[:5]:  # Show first 5 games
        print(f"\nGame ID: {game['game_id']}")
        print(f"  Date: {game['date']}")
        print(f"  Location: {game['location']}")
        print(f"  Teams: {game['team_city']} vs {game['opponent']}")
        print(f"  Score: {game['team_score']}-{game['opponent_score']}")
    '''

if __name__ == "__main__":
    main() 