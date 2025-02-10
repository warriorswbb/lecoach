import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from v1.db.db import SessionLocal
from v1.db.models import Team
import json

def get_team_mappings():
    """
    Get mappings of team_city to team_id from database
    Returns dict like: {"Brock": 1, "Waterloo": 2, ...}
    """
    db = SessionLocal()
    try:
        teams = db.query(Team).all()
        team_map = {team.team_city: team.team_id for team in teams}
        
        # Update constants file
        constants_path = Path(__file__).parent.parent / 'constants' / 'team_ids.py'
        with open(constants_path, 'w') as f:
            f.write('# Auto-generated from database - do not edit directly\n\n')
            f.write('team_ids = {\n')
            for city, id in team_map.items():
                f.write(f'    "{city}": {id},\n')
            f.write('}\n')
            
        print(f"Updated team IDs in {constants_path}")
        return team_map
        
    finally:
        db.close()

if __name__ == "__main__":
    get_team_mappings() 