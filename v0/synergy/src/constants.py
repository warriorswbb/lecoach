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


team_names = {
    "Waterloo Warriors": {
        "city": "Waterloo",
        "team_name": "Warriors",
        "short": "WAT",
        "full_school_name": "University of Waterloo",
    },
    "Acadia Axewomen": {
        "city": "Acadia",
        "team_name": "Axewomen",
        "short": "ACA",
        "full_school_name": "Acadia University",
    },
    "Cape Breton Capers": {
        "city": "Cape Breton",
        "team_name": "Capers",
        "short": "CB",
        "full_school_name": "Cape Breton University",
    },
    "Dalhousie Tigers": {
        "city": "Dalhousie",
        "team_name": "Tigers",
        "short": "DAL",
        "full_school_name": "Dalhousie University",
    },
    "Memorial Sea-Hawks": {
        "city": "Memorial",
        "team_name": "Sea-Hawks",
        "short": "MEM",
        "full_school_name": "Memorial University",
    },
    "St. Francis Xavier X-Women": {
        "city": "StFX",
        "team_name": "X-Women",
        "short": "SFX",
        "full_school_name": "St. Francis Xavier University",
    },
    "Saint Mary's (CAN) Huskies": {
        "city": "Saint Marys",
        "team_name": "Huskies",
        "short": "SMU",
        "full_school_name": "Saint Mary's University",
    },
    "New Brunswick Varsity Reds": {
        "city": "UNB",
        "team_name": "Reds",
        "short": "UNB",
        "full_school_name": "University of New Brunswick",
    },
    "Prince Edward Island Panthers": {
        "city": "UPEI",
        "team_name": "Panthers",
        "short": "UPEI",
        "full_school_name": "University of Prince Edward Island",
    },
    "Alberta Pandas": {
        "city": "Alberta",
        "team_name": "Pandas",
        "short": "ALB",
        "full_school_name": "University of Alberta",
    },
    "Brandon University Bobcats": {
        "city": "Brandon",
        "team_name": "Bobcats",
        "short": "BRA",
        "full_school_name": "Brandon University",
    },
    "Calgary Dinos": {
        "city": "Calgary",
        "team_name": "Dinos",
        "short": "CAL",
        "full_school_name": "University of Calgary",
    },
    "Lethbridge Pronghorns": {
        "city": "Lethbridge",
        "team_name": "Pronghorns",
        "short": "LET",
        "full_school_name": "University of Lethbridge",
    },
    "MacEwan University Griffins": {
        "city": "MacEwan",
        "team_name": "Griffins",
        "short": "MAC",
        "full_school_name": "MacEwan University",
    },
    "Manitoba Bisons": {
        "city": "Manitoba",
        "team_name": "Bisons",
        "short": "MAN",
        "full_school_name": "University of Manitoba",
    },
    "Mount Royal Cougars": {
        "city": "Mount Royal",
        "team_name": "Cougars",
        "short": "MRU",
        "full_school_name": "Mount Royal University",
    },
    "Regina (Canada) Cougars": {
        "city": "Regina",
        "team_name": "Cougars",
        "short": "REG",
        "full_school_name": "University of Regina",
    },
    "Saskatchewan Huskies": {
        "city": "Saskatchewan",
        "team_name": "Huskies",
        "short": "SAS",
        "full_school_name": "University of Saskatchewan",
    },
    "Thompson Rivers University Wolfpack": {
        "city": "Thompson Rivers",
        "team_name": "Wolfpack",
        "short": "TRU",
        "full_school_name": "Thompson Rivers University",
    },
    "Trinity Western Spartans": {
        "city": "Trinity Western",
        "team_name": "Spartans",
        "short": "TWU",
        "full_school_name": "Trinity Western University",
    },
    "British Columbia Thunderbirds": {
        "city": "UBC",
        "team_name": "Thunderbirds",
        "short": "UBC",
        "full_school_name": "University of British Columbia",
    },
    "British Columbia - Okanagan": {
        "city": "UBC Okanagan",
        "team_name": "Heat",
        "short": "UBCO",
        "full_school_name": "University of British Columbia Okanagan",
    },
    "Fraser Valley Cascades": {
        "city": "UFV",
        "team_name": "Cascades",
        "short": "UFV",
        "full_school_name": "University of the Fraser Valley",
    },
    "Northern British Columbia Timberwolves": {
        "city": "UNBC",
        "team_name": "Timberwolves",
        "short": "UNBC",
        "full_school_name": "University of Northern British Columbia",
    },
    "Victoria Vikes": {
        "city": "Victoria",
        "team_name": "Vikes",
        "short": "VIC",
        "full_school_name": "University of Victoria",
    },
    "Winnipeg Wesmen": {
        "city": "Winnipeg",
        "team_name": "Wesmen",
        "short": "WIN",
        "full_school_name": "University of Winnipeg",
    },
    "Algoma Thunderbirds": {
        "city": "Algoma",
        "team_name": "Thunderbirds",
        "short": "ALG",
        "full_school_name": "Algoma University",
    },
    "Brock Badgers": {
        "city": "Brock",
        "team_name": "Badgers",
        "short": "BRO",
        "full_school_name": "Brock University",
    },
    "Carleton University Ravens": {
        "city": "Carleton",
        "team_name": "Ravens",
        "short": "CAR",
        "full_school_name": "Carleton University",
    },
    "Guelph Gryphons": {
        "city": "Guelph",
        "team_name": "Gryphons",
        "short": "GUE",
        "full_school_name": "University of Guelph",
    },
    "Lakehead University Thunderwolves": {
        "city": "Lakehead",
        "team_name": "Thunderwolves",
        "short": "LAK",
        "full_school_name": "Lakehead University",
    },
    "Laurentian Voyageurs": {
        "city": "Laurentian",
        "team_name": "Voyageurs",
        "short": "LAU",
        "full_school_name": "Laurentian University",
    },
    "McMaster Marauders": {
        "city": "McMaster",
        "team_name": "Marauders",
        "short": "MAC",
        "full_school_name": "McMaster University",
    },
    "Nipissing Lakers": {
        "city": "Nipissing",
        "team_name": "Lakers",
        "short": "NIP",
        "full_school_name": "Nipissing University",
    },
    "Ontario Tech": {
        "city": "Ontario Tech",
        "team_name": "Ridgebacks",
        "short": "ONT",
        "full_school_name": "Ontario Tech University",
    },
    "Ottawa Gee-Gees": {
        "city": "Ottawa",
        "team_name": "Gee Gees",
        "short": "OTT",
        "full_school_name": "University of Ottawa",
    },
    "Queens (ON) University Golden Gaels": {
        "city": "Queens",
        "team_name": "Gaels",
        "short": "QUE",
        "full_school_name": "Queen's University",
    },
    "Toronto Metropolitan University": {
        "city": "TMUnow",
        "team_name": "Bold",
        "short": "TMU",
        "full_school_name": "Toronto Metropolitan University",
    },
    "Toronto Varsity Blues": {
        "city": "Toronto",
        "team_name": "Varsity Blues",
        "short": "TOR",
        "full_school_name": "University of Toronto",
    },
    "Western Ontario Mustangs": {
        "city": "Western",
        "team_name": "Mustangs",
        "short": "WES",
        "full_school_name": "Western University",
    },
    "Wilfrid Laurier": {
        "city": "WLUteam",
        "team_name": "Golden Hawks",
        "short": "WLU",
        "full_school_name": "Wilfrid Laurier University",
    },
    "Windsor Lancers": {
        "city": "Windsor",
        "team_name": "Lancers",
        "short": "WIN",
        "full_school_name": "University of Windsor",
    },
    "York (ONT) Lions": {
        "city": "York",
        "team_name": "Lions",
        "short": "YOR",
        "full_school_name": "York University",
    },
    "Bishops Gaiters": {
        "city": "Bishops",
        "team_name": "Gaiters",
        "short": "BIS",
        "full_school_name": "Bishop's University",
    },
    "Concordia (QUE) Stingers": {
        "city": "Concordia",
        "team_name": "Stingers",
        "short": "CON",
        "full_school_name": "Concordia University",
    },
    "Laval University": {
        "city": "Laval",
        "team_name": "Rouge et Or",
        "short": "LAV",
        "full_school_name": "Université Laval",
    },
    "McGill University Martlets": {
        "city": "McGill",
        "team_name": "Martlets",
        "short": "MCG",
        "full_school_name": "McGill University",
    },
    "University Quebec - Montreal": {
        "city": "UQAM",
        "team_name": "Citadins",
        "short": "UQA",
        "full_school_name": "Université du Québec à Montréal",
    }
}
