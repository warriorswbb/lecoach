import requests
import zlib
import json
import csv
import os
# import brotli

gameIds = []
with open('gamesIds.csv', newline='') as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        gameIds.append(row[1])

for id in gameIds:
    url = f'https://basketball.synergysportstech.com/api/games/{id}/events?skip=0&take=1000'

    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjhDRjI4QTUzNTUzOURFMDU3ODFEOEFCRkQ5QUY4QUY1IiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL2F1dGguc3luZXJneXNwb3J0c3RlY2guY29tIiwibmJmIjoxNzI5OTk2NzIwLCJpYXQiOjE3Mjk5OTY3MjAsImV4cCI6MTcyOTk5NzMyMCwiYXVkIjpbImFwaS5jb25maWciLCJhcGkuc2VjdXJpdHkiLCJhcGkuYmFza2V0YmFsbCIsImFwaS5zcG9ydCIsImFwaS5lZGl0b3IiLCJodHRwczovL2F1dGguc3luZXJneXNwb3J0c3RlY2guY29tL3Jlc291cmNlcyJdLCJzY29wZSI6WyJvcGVuaWQiLCJhcGkuY29uZmlnIiwiYXBpLnNlY3VyaXR5IiwiYXBpLmJhc2tldGJhbGwiLCJhcGkuc3BvcnQiLCJhcGkuZWRpdG9yIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdLCJjbGllbnRfaWQiOiJjbGllbnQuYmFza2V0YmFsbC50ZWFtc2l0ZSIsInN1YiI6IjY1ZWYzZTMxZDAyMDZkZWViNGY2ODVmMiIsImF1dGhfdGltZSI6MTcyOTkxNjA2NCwiaWRwIjoibG9jYWwiLCJlbWFpbCI6InN0ZXZlbnRhbnlhbmdAZ21haWwuY29tIiwibmFtZSI6IlN0ZXZlbiBZYW5nIiwic2lkIjoiREY2NTJFQTJBRjU2QjE2QjA5MjVENDY3NTI5OEJGMTUifQ.Rg6nWXvjS8g-r1WwmsjIW7svXmXIuSB11zgcag8OXjlWRQOy4hxl8QYmP2x7r706TzirGPf1fpyuKlVKac8JZlGBpyKyIO7LeC-E2nlTNGCIct2SIcem75Honaa7gysrEngdVuirM2BbBbtigNKkEaqY6KCiGwqplo86s8Wic9gHqxEgwxlp1uMhq-8cwmbrdH8CwVMFOLFAI_FP48emqgdQtcMMq4O8IOypTSUXIm59_6fwSPcnm81bQRVRttd-sVsSiQZUSWI5ILTYqoOdslExgJkRU-k5CTBRxSeGjfWB_9pR8zG_-CfCb2h2OCilCCxzB6rR61qokN7vrBZTOA",
        "newrelic": "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjE0MDM4ODIiLCJhcCI6IjExMjAwMjIxMjMiLCJpZCI6IjUzMDk0NTk2ZTkzY2FkNDAiLCJ0ciI6ImRhOTdkNjg1NWRlNDY3ODBhOWY2Y2FmOWYxMjQ0MTI1IiwidGkiOjE3Mjk5OTY4OTAyNDksInRrIjoiMTM4NDI3MyJ9fQ==",
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

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        if 'gzip' in response.headers.get('Content-Encoding', ''):
            data = zlib.decompress(response.content, 16+zlib.MAX_WBITS)
        elif 'deflate' in response.headers.get('Content-Encoding', ''):
            data = zlib.decompress(response.content)
        else:
            data = response.content 

        try:
            json_data = json.loads(data)
            print(json_data)
        except json.JSONDecodeError:
            print("The response is not JSON-formatted.")
            print("Decoded response content:", data.decode('utf-8', errors='replace'))
    else:
        print(f"Request failed with status code {response.status_code}")
        print("Response content:", response.text)