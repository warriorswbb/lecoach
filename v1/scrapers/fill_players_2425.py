import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

import requests
from bs4 import BeautifulSoup
from v1.constants.constants import team_names
from v1.db.db import SessionLocal
from v1.db import crud

def get_players_from_team_page(team_city: str) -> list:
    """
    Scrapes player data from a team's roster page on usportshoops.ca
    
    The site structure as of Feb 2025:
    - Each team page has multiple tables
    - The roster table has columns: No, Player, Pos, Ht, Elig, Hometown, High School
    - Player names might be in <a> tags or plain text
    
    Args:
        team_city: City name that matches the URL parameter (e.g., "Brock", "Waterloo")
        
    Returns:
        List of dicts containing player info with keys:
        - team_city: str
        - name: str (full name as shown on site)
        - number: str (jersey number)
        - position: str
        - height: str
        - year: str (eligibility year)
        - hometown: str
        - high_school: str
    """
    url = f"https://usportshoops.ca/history/teamseason.php?Gender=WBB&Season=2024-25&Team={team_city}"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find the roster table - it's the one with "Player" and "Pos" in headers
    tables = soup.find_all('table')
    roster_table = None
    for table in tables:
        if table.find('tr') and "Player" in table.find('tr').text and "Pos" in table.find('tr').text:
            roster_table = table
            break
            
    if not roster_table:
        print(f"No roster table found for {team_city}")
        return []
    
    players = []
    for row in roster_table.find_all('tr')[1:]:  # Skip header row
        cols = row.find_all('td')
        if len(cols) >= 7:
            # Player names might be in <a> tags for players with profile pages
            name_col = cols[1]
            name = name_col.find('a').text.strip() if name_col.find('a') else name_col.text.strip()
            
            player = {
                'team_city': team_city,
                'name': name,
                'number': cols[0].text.strip(),
                'position': cols[2].text.strip(),
                'height': cols[3].text.strip(),
                'year': cols[4].text.strip(),
                'hometown': cols[5].text.strip(),
                'high_school': cols[6].text.strip()
            }
            players.append(player)
    
    return players

def main():
    """
    Main script to populate players table with 2024-25 rosters
    
    Flow:
    1. Scrape all team rosters from usportshoops.ca
    2. Check against existing players in DB to avoid duplicates
    3. Add new players, linking them to their teams
    
    Note: This assumes teams are already in the database with correct city names.
    The crud.create_player_from_scrape function handles:
    - Finding team_id from team_city
    - Splitting full name into first/last names
    - Creating the player record
    
    Run this when:
    - Setting up initial player data
    - Adding new players at start of season
    - Updating rosters mid-season
    """
    # Get all players from all team pages
    all_players = []
    for team in team_names:
        print(f"\nProcessing {team['city']}...")
        team_players = get_players_from_team_page(team['city'])
        print(f"Found {len(team_players)} players")
        all_players.extend(team_players)
    
    print(f"\nTotal players found: {len(all_players)}")
    
    # Add new players to database
    db = SessionLocal()
    try:
        # Cache existing players to avoid DB queries in loop
        existing_players = crud.get_players(db)
        existing_names = {p.player_name for p in existing_players}
        
        added_count = 0
        skipped_count = 0
        
        for player in all_players:
            if player['name'] not in existing_names:
                try:
                    crud.create_player_from_scrape(db, player)
                    print(f"Added: {player['name']} ({player['team_city']})")
                    added_count += 1
                except Exception as e:
                    print(f"Error adding {player['name']}: {str(e)}")
            else:
                print(f"Skipped (exists): {player['name']} ({player['team_city']})")
                skipped_count += 1
        
        print(f"\nSummary:")
        print(f"Players found: {len(all_players)}")
        print(f"Players added: {added_count}")
        print(f"Players skipped: {skipped_count}")
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
