import requests
import zlib
import json
import csv
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
# import brotli

game_ids = []
with open('data/ids.csv', newline='') as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        game_ids.append(row[1])

headers = {
    "accept": "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9",
    "authorization": (
        "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjhDRjI4QTUzNTUzOURFMDU3ODFEOEFCRkQ5QUY4QUY1"
        "IiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL2F1dGguc3luZXJneXNwb3J0c3RlY2guY29t"
        "IiwibmJmIjoxNzMwMDA0NDAwLCJpYXQiOjE3MzAwMDQ0MDAsImV4cCI6MTczMDAwNTAwMCwiYXVkIjpb"
        "ImFwaS5jb25maWciLCJhcGkuc2VjdXJpdHkiLCJhcGkuYmFza2V0YmFsbCIsImFwaS5zcG9ydCIsImFw"
        "aS5lZGl0b3IiLCJodHRwczovL2F1dGguc3luZXJneXNwb3J0c3RlY2guY29tL3Jlc291cmNlcyJdLCJz"
        "Y29wZSI6WyJvcGVuaWQiLCJhcGkuY29uZmlnIiwiYXBpLnNlY3VyaXR5IiwiYXBpLmJhc2tldGJhbGwi"
        "LCJhcGkuc3BvcnQiLCJhcGkuZWRpdG9yIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdLCJj"
        "bGllbnRfaWQiOiJjbGllbnQuYmFza2V0YmFsbC50ZWFtc2l0ZSIsInN1YiI6IjY1ZWYzZTMxZDAyMDZk"
        "ZWViNGY2ODVmMiIsImF1dGhfdGltZSI6MTcyOTkxNjA2NCwiaWRwIjoibG9jYWwiLCJlbWFpbCI6InN0"
        "ZXZlbnRhbnlhbmdAZ21haWwuY29tIiwibmFtZSI6IlN0ZXZlbiBZYW5nIiwic2lkIjoiREY2NTJFQTJB"
        "RjU2QjE2QjA5MjVENDY3NTI5OEJGMTUifQ.c3-8SmcjJTEX9s-qJJLGRAhJkoLEQEfv7ecObEY925iTo90q"
        "MgQ2HzN7pdkfRegdGX9fbN2_J-BL5g8w2oFQLLCu9NwFEvsqdOUeH1zvfBaw16TbTnWcuEfUrR0CnUabev"
        "C4Jy-BgAPqTg3bbcMJ70EUeHG5VVVVPCDC-qjbU5auFf68CVEMvbSh1cACkDDI9ETb9yo4ck4X7qGEc9T"
        "czQCPFOkELMAYwzXvnsJvVEg2xNspMReMYafcYieeSxyFBHXsENDeIVV-GUgCihPdrofSD-hFc68t55lk"
        "EwmI_Uj91LJ7CID-B1tjy5-oqS98coZPX2Buz8TH6weqc3aP2g"
    ),
    "newrelic": (
        "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjE0MDM4ODIiLCJhcCI6IjExMjAwMjIx"
        "MjMiLCJpZCI6ImI1YTZhMDcyYWM2NzI5YTMiLCJ0ciI6ImIxZjg0ZGIyZjNkNDJkNTYwMTc1M2Y3OTg1"
        "ZmQyZmRmIiwidGkiOjE3MzAwMDQ4Mjg0NDksInRrIjoiMTM4NDI3MyJ9fQ=="
    ),
    "origin": "https://apps.synergysports.com",
    "priority": "u=1, i",
    "referer": "https://apps.synergysports.com/",
    "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "x-synergy-client": "ProductVersion=2024.10.15.3688; ProductName=Basketball.TeamSite"
}


def fetch_game_data(game_id):
    url = f'https://basketball.synergysportstech.com/api/games/{game_id}/events?skip=0&take=1000'
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        if 'gzip' in response.headers.get('Content-Encoding', ''):
            data = zlib.decompress(response.content, 16+zlib.MAX_WBITS)
        elif 'deflate' in response.headers.get('Content-Encoding', ''):
            data = zlib.decompress(response.content)
        else:
            data = response.content

        json_data = json.loads(data)
        with open(f"play_by_play_data/{game_id}.json", "w") as json_file:
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