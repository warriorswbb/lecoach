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

url = "https://basketball.synergysportstech.com/api/games"

headers = {
    "accept": "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9",
    "authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjhDRjI4QTUzNTUzOURFMDU3ODFEOEFCRkQ5QUY4QUY1IiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL2F1dGguc3luZXJneXNwb3J0c3RlY2guY29tIiwibmJmIjoxNzMwMDAyNzIwLCJpYXQiOjE3MzAwMDI3MjAsImV4cCI6MTczMDAwMzMyMCwiYXVkIjpbImFwaS5jb25maWciLCJhcGkuc2VjdXJpdHkiLCJhcGkuYmFza2V0YmFsbCIsImFwaS5zcG9ydCIsImFwaS5lZGl0b3IiLCJodHRwczovL2F1dGguc3luZXJneXNwb3J0c3RlY2guY29tL3Jlc291cmNlcyJdLCJzY29wZSI6WyJvcGVuaWQiLCJhcGkuY29uZmlnIiwiYXBpLnNlY3VyaXR5IiwiYXBpLmJhc2tldGJhbGwiLCJhcGkuc3BvcnQiLCJhcGkuZWRpdG9yIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdLCJjbGllbnRfaWQiOiJjbGllbnQuYmFza2V0YmFsbC50ZWFtc2l0ZSIsInN1YiI6IjY1ZWYzZTMxZDAyMDZkZWViNGY2ODVmMiIsImF1dGhfdGltZSI6MTcyOTkxNjA2NCwiaWRwIjoibG9jYWwiLCJlbWFpbCI6InN0ZXZlbnRhbnlhbmdAZ21haWwuY29tIiwibmFtZSI6IlN0ZXZlbiBZYW5nIiwic2lkIjoiREY2NTJFQTJBRjU2QjE2QjA5MjVENDY3NTI5OEJGMTUifQ.X98dfDbhlkOrJXvOjrD9d8fuw9irSI_8VeDb7uivlUzWHETxvii1zpa2ZKCbwOmq2kdRQAC9pzdRDFesAIQynOqYHcHtXUzfaPaR3oujLKLXEVVG2VawSshYrFYsLZSCiO4v7iroEJ_BYLRjHdnKEqDl-vR27gY6NC5fekvcsQeqYi5LvU0U6RqFVqctaCNqp4W3ZIabC1JcLCw_Rda0H7HQ7cfB34emaoHlLxllf1u_hFG3WLwEy8srCOhhgjdj1tY5WymaQu2w8LoarWyCFvIsq8LPCS6-YmZDb85MsWqYVRJ2nW6wkJ_21sNqJjhlJWcJZdZQP9I1c_jZcbiRpA",
    "content-length": "863",
    "content-type": "application/json; charset=UTF-8",
    "newrelic": "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjE0MDM4ODIiLCJhcCI6IjExMjAwMjIxMjMiLCJpZCI6ImVjMzc4OTlhZTIzMjA3YmEiLCJ0ciI6ImRjOTQ5OGNhYzI0ZGE2YmUxNTYwMzIwMDkxYTk1ZTI4IiwidGkiOjE3MzAwMDMwNDUxMzUsInRrIjoiMTM4NDI3MyJ9fQ==",
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

#TODO - test this
print("Season,Game ID,UTC Date,Game Name,Home Team,Away Team")

for season in seasons:
    # Payload (data) for the POST request
    payload = {
        "excludeGamesWithoutCompetition": True,
        "seasonIds": [f"{season}"],
        "competitionIds": [
            "560100ac8dc7a24394b95643", "56d89e6d50238a164760b711", 
            "560100ac8dc7a24394b95617", "560100ac8dc7a24394b95637", 
            "560100ac8dc7a24394b95684", "560100ac8dc7a24394b95685",
            "560100ac8dc7a24394b95674", "56010b438dc7a25554523b23", 
            "623b3ee36b7ff0a2745e33be", "560100ac8dc7a24394b95655",
            "560100ac8dc7a24394b95653", "56d89e6d50238a164760b710",
            "56d89e6d50238a164760b70f", "560100ac8dc7a24394b95662",
            "560100ac8dc7a24394b95632", "560100ac8dc7a24394b95644",
            "5c8f491bf52909811edc8409", "560100ac8dc7a24394b9562c",
            "560100ac8dc7a24394b95665", "56de080050238a16476195f2",
            "560100ac8dc7a24394b95645", "560100ac8dc7a24394b9566e",
            "623b3ef28863b92839774246"
        ],
        "skip": 0,
        "take": 1000,
        "endDate": "2024-10-28T01:52:42.705Z",
        "statuses": [4, 1, 2, 3, 5],
        "sort": "utc:desc",
        "conferenceIds": ["54457dcf300969b132fcfb7d"]
    }

    response = requests.post(url, headers=headers, json=payload)

    # Check the response
    if response.status_code == 200:
        data = response.json()

        for game in data["result"]:
           print(f"{game['season']['name']},{game['id']},{game['utcDate']},{game['name']},{game['homeTeam']['fullName']},{game['awayTeam']['fullName']}")
    else:
        print(f"Request failed with status code {response.status_code}")
        print(response.text)  # Print response text for debugging