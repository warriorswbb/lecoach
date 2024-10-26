import json
from collections import defaultdict

with open('plays.json', 'r') as file:
    data = json.load(file)

shotCounter = 0
shotTypes = ["Miss 2 Pts", "Make 2 Pts", "Miss 3 Pts", "Make 3 Pts"]
shots = defaultdict(list)
prev = 0
prevPlay = ""

errorPlays = []
shotAfterTo = []

#TODO - use transition tag in description

for play in data["result"]:
    print("_________")
    # values
    id = play["id"]
    name = play["name"]
    shot = name in shotTypes
    player = play["playActors"][0]["player"]["name"]
    team = play["playActors"][0]["team"]["abbr"]
    shotCoords = [play["shotX"], play["shotY"]] if "shotX" in play else [None, None]

    # process shots
    if shot:
        if not play["id"] in shots:
            shots[play["id"]] = play["name"]
            shotCounter += 1

    # handle clock
    if not "clock" in play:
        print("no clock- ", play["name"])
        continue

    if prev != 0:
        shotClock = (prev - play["clock"]) // 10
        print((prev - play["clock"]) // 10)
        min = (play["clock"] // 10) // 60
        sec = (play["clock"] // 10) % 60
        print(min,":",sec)

        if shotClock < 0 or shotClock > 24 and shot:
            errorPlays.append(id)
            print("ERROR")

    if shot and prevPlay == "Turnover":
        shotClock = (prev - play["clock"]) // 10
        shotAfterTo.append([name, id, shotClock])

    prev = play["clock"]
    prevPlay = play["name"]

    # print("_________")
    # shot = play["name"] in shotTypes

    # if shot:
    #     shotCounter += 1

    # if not "clock" in play:
    #     print("no clock- ", play["name"])
    #     if shot:
    #         print(play["id"])
    #         shotClock["no_clock"].append((play["id"], None))
    #     continue

    # if prev == 0:
    #     prev = play["clock"]
    #     continue

    # cur = play["clock"]
    # if prev - cur < 10:
    #     shotClock["quick_shot"].append((play["id"], prev - cur))
    #     print(play["id"])

    # prev = cur
    # min = (play["clock"] // 10) // 60
    # sec = (play["clock"] // 10) % 60
    # print(min,":",sec)

    # print(play["name"], play["playActors"][0]["team"]["abbr"])


# for i in shotClock["no_clock"]:
#     print(i)
#     # for play in data["result"]:
#     #     if play["id"] == i:
#     #         print(play["name"], play["playActors"][0]["team"]["abbr"])
#     #         break
#     print("_________")  


# print("QUICK SHOTS")    
# for i in shotClock["quick_shot"]:
#     print(i)
#     # for play in data["result"]:
#     #     if play["id"] == i:
#     #         print(play["name"], play["playActors"][0]["team"]["abbr"])
#     #         break
#     print("_________")

# print(shotClock)
# print(shotCounter)
print(len(shots))
print(shotCounter)
print(errorPlays)

for p in shotAfterTo:
    print(p)