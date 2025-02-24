import requests
import zlib
import json
import os
import brotli
from dotenv import load_dotenv

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

#TODO - test this
print("Season,Game ID,UTC Date,Game Name,Home Team,Away Team")

for season in seasons:
    # Payload (data) for the POST request
    payload = {
        "excludeGamesWithoutCompetition": True,
        "seasonIds": [f"{season}"],
        "competitionDefinitionKey": "54457dce300969b132fcfb38:CEE",
        "skip": 0,
        "take": 100,
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
                    print(f'{game["season"]["name"]},'
                          f'{game["id"]},'
                          f'{game["utcDate"]},'
                          f'"{game["name"]}",'
                          f'"{game["homeTeam"]["fullName"]}",'
                          f'"{game["awayTeam"]["fullName"]}"')
            else:
                print("No results found in response")
        except Exception as e:
            print(f"Error processing response: {str(e)}")
            print(f"Raw response: {response.text[:200]}")
    else:
        print(f"Request failed with status code {response.status_code}")
        print(f"Error response: {response.text}")