import pandas as pd
from datetime import datetime
from constants import team_names

# Load data and specify column names
data = pd.read_csv('data/ids.csv', names=['Season', 'GameID', 'UTCDate', 'GameName', 'Team1_FullName', 'Team2_FullName'])

# Function to format the GameID for the database
def format_game_id(season, utc_date, team1, team2):
    season_id = "W"
    try:
        date_str = datetime.strptime(utc_date.split("T")[0], '%Y-%m-%d').strftime('%Y%m%d')
    except ValueError:
        print(f"Invalid date format in row: '{utc_date}'")
        return "INVALID_DATE"

    # Get short names or 'UNK' if not found
    team1_short = team_names.get(team1, {}).get('short', 'UNK')
    team2_short = team_names.get(team2, {}).get('short', 'UNK')
    
    # Construct the GameID
    game_id = f"{season_id}{date_str}{team1_short}{team2_short}"
    return game_id

# Generate GameID_DB using the function
data['GameID_DB'] = data.apply(lambda row: format_game_id(row['Season'], row['UTCDate'], row['Team1_FullName'], row['Team2_FullName']), axis=1)

# Save the updated DataFrame with the new GameID_DB column
data.to_csv('data/ids_with_game_id.csv', index=False)

print("Game IDs have been generated and saved to data/ids_with_game_id.csv")
