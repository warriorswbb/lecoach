import requests
import zlib
import json
# import brotli

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

# we need game ids not season ids

# regular play by play
# url = 'https://basketball.synergysportstech.com/api/games/66d5fe577807bd945ec7f2ba/playbyplays?skip=0&take=1000'


# play by play with shot coordinates

for id in seasons:
    url = f'https://basketball.synergysportstech.com/api/games/{id}/events?skip=0&take=1000'

    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjhDRjI4QTUzNTUzOURFMDU3ODFEOEFCRkQ5QUY4QUY1IiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL2F1dGguc3luZXJneXNwb3J0c3RlY2guY29tIiwibmJmIjoxNzI5OTAxNDQ3LCJpYXQiOjE3Mjk5MDE0NDcsImV4cCI6MTcyOTkwMjA0NywiYXVkIjpbImFwaS5jb25maWciLCJhcGkuc2VjdXJpdHkiLCJhcGkuYmFza2V0YmFsbCIsImFwaS5zcG9ydCIsImFwaS5lZGl0b3IiLCJodHRwczovL2F1dGguc3luZXJneXNwb3J0c3RlY2guY29tL3Jlc291cmNlcyJdLCJzY29wZSI6WyJvcGVuaWQiLCJhcGkuY29uZmlnIiwiYXBpLnNlY3VyaXR5IiwiYXBpLmJhc2tldGJhbGwiLCJhcGkuc3BvcnQiLCJhcGkuZWRpdG9yIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdLCJjbGllbnRfaWQiOiJjbGllbnQuYmFza2V0YmFsbC50ZWFtc2l0ZSIsInN1YiI6IjY1ZWYzZTMxZDAyMDZkZWViNGY2ODVmMiIsImF1dGhfdGltZSI6MTcyODgzOTc4MiwiaWRwIjoibG9jYWwiLCJlbWFpbCI6InN0ZXZlbnRhbnlhbmdAZ21haWwuY29tIiwibmFtZSI6IlN0ZXZlbiBZYW5nIiwic2lkIjoiOTdGQkJCRkU3NDM2OTBFRTlGQ0VEQjY1QThGMzI1NzAifQ.Z8fsWnxg3_WT3VMDDbPT3fNsARzo7JE29nZpijXoR4AmdV3ZrpvOV7KnNqSXTRqM1eju9Yh9I42gkzNzwpHZSCAF0CQJ4UqPYVt-i_0MCtCbtiqTS-utRLPh3YRHhpwAHKpwhsE78m98P5LTqGX1H3esZp5VJ055KhO0aoiin2roD8iU1loNk-8kYpn8xt6FBRaN1V_6NTtTG7eFUpqZFxfQ-4o6tAG5A5wgnpINPOwvzYY05ZY6NNiDJN6WdFZTl4eRODJOosuStOqIz5PruBwMQ8SMV27bAfvOfrKPWy0-KHTit5vUxOapQ6PNksYtLdPZfvETEYHK28oBsVWRDA",
        "newrelic": "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjE0MDM4ODIiLCJhcCI6IjExMjAwMjIxMjMiLCJpZCI6ImE4NWZiNmQ0YTIxNmQyYmIiLCJ0ciI6IjQ1NjQzMWVhYjc0OGRkMzg0NzFmZjQzYzI4NzZjYTc4IiwidGkiOjE3Mjk5MDE1NzE3OTksInRrIjoiMTM4NDI3MyJ9fQ==",
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