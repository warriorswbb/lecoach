import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

"""
Script to fetch all games from Synergy API and save to CSV file

Flow:
1. Fetches games for each season from Synergy API
2. Processes response data into CSV format
3. Saves results to output/ids.csv

CSV Format:
- Season: Season name (e.g., "2024-2025")
- Game ID: Synergy's internal game ID
- UTC Date: Game date in UTC format
- Game Name: Short game description
- Home Team: Full name of home team
- Away Team: Full name of away team

Example row:
2024-2025,66d5deb58f44bce4fb5069fa,2025-02-07T23:00:00Z,"CarletonUni@UniOttawa","Ottawa Gee-Gees","Carleton University Ravens"

This script is typically run:
- When initializing the database
- To update game records periodically
- Before running matchgameids.py to generate standardized game IDs
"""

import requests
import zlib
import json
import os
import brotli
from dotenv import load_dotenv
import csv

load_dotenv()

seasons = [
    "57589fa55762021398add0e5", # 2014-15
    "57589fa55762021398add0e6", # 2015-16
    "57b63ce457620213988eb087", # 2016-17
    "59d33e3144b2b8aa7e26c3f3", # 2017-18
    "5b72832e11ef0d1103e22fb3", # 2018-19
    "5bb32f6faeda7199396199f9", # 2019-20
    "5f809bd41cb0540001a542a7", # 2020-21
    "61368adda9139a5be9761ade", # 2021-22
    "630530d30a41b857ff3c1501", # 2022-23
    "64da35a80d288f7495c0bdca", # 2023-24
    "66c6294bac528f0cafb5ea59", # 2024-25
]

url = "https://basketball.synergysportstech.com/api/games"

headers = {
    "accept": "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9",
    "authorization": os.getenv('SYNERGY_TOKEN'),
    "content-type": "application/json; charset=UTF-8",
    "origin": "https://apps.synergysports.com",
    "referer": "https://apps.synergysports.com/",
    "x-synergy-client": "ProductVersion=2025.02.13.5203; ProductName=Basketball.TeamSite"
}

# Create output directory if it doesn't exist
os.makedirs('output', exist_ok=True)

# Open CSV file for writing
with open('output/ids.csv', 'w', newline='') as csvfile:
    csvwriter = csv.writer(csvfile)
    # Write header
    csvwriter.writerow(['Season', 'Game ID', 'UTC Date', 'Game Name', 'Home Team', 'Away Team'])

    for season in seasons:
        # Payload (data) for the POST request
        payload = {
            "excludeGamesWithoutCompetition": True,
            "seasonIds": [f"{season}"],
            "competitionDefinitionKey": "54457dce300969b132fcfb38:CEE",
            "skip": 0,
            "take": 5000,
            "endDate": "2025-02-25T03:46:42.473Z",
            "statuses": [4, 1, 2, 3, 5],
            "sort": "utc:desc",
            "conferenceIds": ["54457dcf300969b132fcfb7d"]
        }

        response = requests.post(url, headers=headers, json=payload)

        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                # Let requests handle decompression automatically
                data = response.json()
                
                if "result" in data and isinstance(data["result"], list):
                    for game in data["result"]:
                        csvwriter.writerow([
                            game["season"]["name"],
                            game["id"],
                            game["utcDate"],
                            game["name"],
                            game["homeTeam"]["fullName"],
                            game["awayTeam"]["fullName"]
                        ])
                else:
                    print("No results found in response")
            except Exception as e:
                print(f"Error processing response: {str(e)}")
                print(f"Raw response: {response.text[:200]}")
        else:
            print(f"Request failed with status code {response.status_code}")
            print(f"Error response: {response.text}")