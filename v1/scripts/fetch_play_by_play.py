"""
Script to fetch play-by-play data from Synergy Sports API

Flow:
1. Reads game IDs from ids.csv
2. Makes concurrent API requests to Synergy's play-by-play endpoint
3. Handles various response encodings (gzip, deflate)
4. Saves raw JSON responses to files

Configuration:
- Uses ThreadPoolExecutor for concurrent requests (30 workers)
- Requires SYNERGY_TOKEN in .env file
- Skips existing files to allow for partial runs

Output:
- Creates JSON files in output/pbp_data/{game_id}.json
- Each file contains full play-by-play data for one game

Run this when:
- Initially populating play-by-play data
- Fetching data for new games
- Updating existing play-by-play data

Note: This script requires valid Synergy Sports API credentials
and respects rate limits through concurrent request management.
ids2.csv was used when my computer ran out of memory and missed out on the last few games. 
"""

import requests
import zlib
import json
import csv
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

load_dotenv()
# import brotli

game_ids = []
with open('output/ids.csv', newline='') as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        game_ids.append(row[1])

headers = {
    "accept": "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9",
    "authorization": os.getenv('SYNERGY_TOKEN'),
    "newrelic": "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjE0MDM4ODIiLCJhcCI6IjExMjAwMjIxMjMiLCJpZCI6ImNmOWRmZjVkOWY3ZjBmZDAiLCJ0ciI6IjQ1YjQyOWU2NGNmZGE5ZDhhYjU4OWJlODhiMWJlNjU3IiwidGkiOjE3NDA0MjM1OTkxODMsInRrIjoiMTM4NDI3MyJ9fQ==",
    "origin": "https://apps.synergysports.com",
    "priority": "u=1, i",
    "referer": "https://apps.synergysports.com/",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
    "x-synergy-client": "ProductVersion=2025.02.13.5203; ProductName=Basketball.TeamSite"
}

def fetch_game_data(game_id):
    url = f'https://basketball.synergysportstech.com/api/games/{game_id}/events'
    params = {
        'skip': 0,
        'take': 1000
    }
    file_path = f"play_by_play_data/{game_id}.json"

    if os.path.exists(file_path):
        print(f"Data for game {game_id} already exists.")
        return
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        if 'gzip' in response.headers.get('Content-Encoding', ''):
            data = zlib.decompress(response.content, 16+zlib.MAX_WBITS)
        elif 'deflate' in response.headers.get('Content-Encoding', ''):
            data = zlib.decompress(response.content)
        else:
            data = response.content

        json_data = json.loads(data)
        with open(f"output/pbp_data/{game_id}.json", "w") as json_file:
            json.dump(json_data, json_file, indent=4)
        
        print(f"Data for game {game_id} saved successfully.")
    except requests.exceptions.RequestException as e:
        print(f"Request failed for game {game_id}: {e}")
    except json.JSONDecodeError:
        print(f"The response for game {game_id} is not JSON-formatted.")
    except Exception as e:
        print(f"An error occurred for game {game_id}: {e}")

with ThreadPoolExecutor(max_workers=30) as executor:
    futures = [executor.submit(fetch_game_data, game_id) for game_id in game_ids]
    for future in as_completed(futures):
        try:
            future.result()
        except Exception as exc:
            print(f"An error occurred: {exc}")