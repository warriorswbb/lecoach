import requests
import zlib
import json
# import brotli

url = 'https://basketball.synergysportstech.com/api/games/66d5fe577807bd945ec7f2ba/playbyplays?skip=0&take=1000'

headers = {
    "accept": "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9",
    "authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjhDRjI4QTUzNTUzOURFMDU3ODFEOEFCRkQ5QUY4QUY1IiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL2F1dGguc3luZXJneXNwb3J0c3RlY2guY29tIiwibmJmIjoxNzI4ODM5NzgzLCJpYXQiOjE3Mjg4Mzk3ODMsImV4cCI6MTcyODg0MDM4MywiYXVkIjpbImFwaS5jb25maWciLCJhcGkuc2VjdXJpdHkiLCJhcGkuYmFza2V0YmFsbCIsImFwaS5zcG9ydCIsImFwaS5lZGl0b3IiLCJodHRwczovL2F1dGguc3luZXJneXNwb3J0c3RlY2guY29tL3Jlc291cmNlcyJdLCJzY29wZSI6WyJvcGVuaWQiLCJhcGkuY29uZmlnIiwiYXBpLnNlY3VyaXR5IiwiYXBpLmJhc2tldGJhbGwiLCJhcGkuc3BvcnQiLCJhcGkuZWRpdG9yIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdLCJjbGllbnRfaWQiOiJjbGllbnQuYmFza2V0YmFsbC50ZWFtc2l0ZSIsInN1YiI6IjY1ZWYzZTMxZDAyMDZkZWViNGY2ODVmMiIsImF1dGhfdGltZSI6MTcyODgzOTc4MiwiaWRwIjoibG9jYWwiLCJlbWFpbCI6InN0ZXZlbnRhbnlhbmdAZ21haWwuY29tIiwibmFtZSI6IlN0ZXZlbiBZYW5nIiwic2lkIjoiOTdGQkJCRkU3NDM2OTBFRTlGQ0VEQjY1QThGMzI1NzAifQ.CGitl0e-nBXhv1-lFbepyQBmy_S4ZnntS-6ORIu3po87B2RvbFkf-bCLL98CpvVoINOIt6qUCge6pVOzmELPv9NtzG8allFrwENAjU-XqbTeeb8B8hhOLaA2Qs1IriNbtPlo-zEoOatweDCHhIgHsDiiVHSNDPTU6PR4kvUv9u2ZGDJkQe2dQ3JpGD4DOt-DFQGC_5wAKK782ZaNtn2sgobug_ORySGsOSwOoS3667xb8guXPG5KYC7zcWHF6qk9gAFbPkIoX_ENWdKAAahwPtF93DiBsq4_7m-40D-XKxWbMWRsDji_TTNHnqt4q_ePKAjjROzOTnlKsOMKBLrySQ",
    "newrelic": "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjE0MDM4ODIiLCJhcCI6IjExMjAwMjIxMjMiLCJpZCI6ImZiMjg0OGE2NzY2MjBmOTYiLCJ0ciI6IjA2MDIzNGE4YjBiYTU1NzBkMjBlMWFiMGU2NGNmZGRjIiwidGkiOjE3Mjg4Mzk3ODUzMDksInRrIjoiMTM4NDI3MyJ9fQ==",
    "origin": "https://apps.synergysports.com",
    "priority": "u=1, i",
    "referer": "https://apps.synergysports.com/",
    "sec-ch-ua": '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "x-synergy-client": "ProductVersion=2024.10.08.3191; ProductName=Basketball.TeamSite"
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