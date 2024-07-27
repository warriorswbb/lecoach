const knex = require('knex')(require('./knexfile').development);

const teamNames = [
  {
    city: "Waterloo",
    teamName: "Warriors",
    short: "WAT",
    fullSchoolName: "University of Waterloo",
    fullTeamName: "Waterloo Warriors",
  },
  {
    city: "Acadia",
    teamName: "Axewomen",
    short: "ACA",
    fullSchoolName: "Acadia University",
    fullTeamName: "Acadia Axewomen",
  },
  {
    city: "Cape Breton",
    teamName: "Capers",
    short: "CB",
    fullSchoolName: "Cape Breton University",
    fullTeamName: "Cape Breton Capers",
  },
  {
    city: "Dalhousie",
    teamName: "Tigers",
    short: "DAL",
    fullSchoolName: "Dalhousie University",
    fullTeamName: "Dalhousie Tigers",
  },
  {
    city: "Memorial",
    teamName: "Sea-Hawks",
    short: "MEM",
    fullSchoolName: "Memorial University",
    fullTeamName: "Memorial Sea-Hawks",
  },
  {
    city: "StFX",
    teamName: "X-Women",
    short: "SFX",
    fullSchoolName: "St. Francis Xavier University",
    fullTeamName: "St. Francis Xavier X-Women",
  },
  {
    city: "Saint Marys",
    teamName: "Huskies",
    short: "SMU",
    fullSchoolName: "Saint Mary's University",
    fullTeamName: "Saint Mary's Huskies",
  },
  {
    city: "UNB",
    teamName: "Reds",
    short: "UNB",
    fullSchoolName: "University of New Brunswick",
    fullTeamName: "UNB Reds",
  },
  {
    city: "UPEI",
    teamName: "Panthers",
    short: "UPEI",
    fullSchoolName: "University of Prince Edward Island",
    fullTeamName: "UPEI Panthers",
  },
  {
    city: "Alberta",
    teamName: "Pandas",
    short: "ALB",
    fullSchoolName: "University of Alberta",
    fullTeamName: "Alberta Pandas",
  },
  {
    city: "Brandon",
    teamName: "Bobcats",
    short: "BRA",
    fullSchoolName: "Brandon University",
    fullTeamName: "Brandon Bobcats",
  },
  {
    city: "Calgary",
    teamName: "Dinos",
    short: "CAL",
    fullSchoolName: "University of Calgary",
    fullTeamName: "Calgary Dinos",
  },
  {
    city: "Lethbridge",
    teamName: "Pronghorns",
    short: "LET",
    fullSchoolName: "University of Lethbridge",
    fullTeamName: "Lethbridge Pronghorns",
  },
  {
    city: "MacEwan",
    teamName: "Griffins",
    short: "MAC",
    fullSchoolName: "MacEwan University",
    fullTeamName: "MacEwan Griffins",
  },
  {
    city: "Manitoba",
    teamName: "Bisons",
    short: "MAN",
    fullSchoolName: "University of Manitoba",
    fullTeamName: "Manitoba Bisons",
  },
  {
    city: "Mount Royal",
    teamName: "Cougars",
    short: "MRU",
    fullSchoolName: "Mount Royal University",
    fullTeamName: "Mount Royal Cougars",
  },
  {
    city: "Regina",
    teamName: "Cougars",
    short: "REG",
    fullSchoolName: "University of Regina",
    fullTeamName: "Regina Cougars",
  },
  {
    city: "Saskatchewan",
    teamName: "Huskies",
    short: "SAS",
    fullSchoolName: "University of Saskatchewan",
    fullTeamName: "Saskatchewan Huskies",
  },
  {
    city: "Thompson Rivers",
    teamName: "Wolfpack",
    short: "TRU",
    fullSchoolName: "Thompson Rivers University",
    fullTeamName: "Thompson Rivers Wolfpack",
  },
  {
    city: "Trinity Western",
    teamName: "Spartans",
    short: "TWU",
    fullSchoolName: "Trinity Western University",
    fullTeamName: "Trinity Western Spartans",
  },
  {
    city: "UBC",
    teamName: "Thunderbirds",
    short: "UBC",
    fullSchoolName: "University of British Columbia",
    fullTeamName: "UBC Thunderbirds",
  },
  {
    city: "UBC Okanagan",
    teamName: "Heat",
    short: "UBCO",
    fullSchoolName: "University of British Columbia Okanagan",
    fullTeamName: "UBC Okanagan Heat",
  },
  {
    city: "UFV",
    teamName: "Cascades",
    short: "UFV",
    fullSchoolName: "University of the Fraser Valley",
    fullTeamName: "UFV Cascades",
  },
  {
    city: "UNBC",
    teamName: "Timberwolves",
    short: "UNBC",
    fullSchoolName: "University of Northern British Columbia",
    fullTeamName: "UNBC Timberwolves",
  },
  {
    city: "Victoria",
    teamName: "Vikes",
    short: "VIC",
    fullSchoolName: "University of Victoria",
    fullTeamName: "Victoria Vikes",
  },
  {
    city: "Winnipeg",
    teamName: "Wesmen",
    short: "WIN",
    fullSchoolName: "University of Winnipeg",
    fullTeamName: "Winnipeg Wesmen",
  },
  {
    city: "Algoma",
    teamName: "Thunderbirds",
    short: "ALG",
    fullSchoolName: "Algoma University",
    fullTeamName: "Algoma Thunderbirds",
  },
  {
    city: "Brock",
    teamName: "Badgers",
    short: "BRO",
    fullSchoolName: "Brock University",
    fullTeamName: "Brock Badgers",
  },
  {
    city: "Carleton",
    teamName: "Ravens",
    short: "CAR",
    fullSchoolName: "Carleton University",
    fullTeamName: "Carleton Ravens",
  },
  {
    city: "Guelph",
    teamName: "Gryphons",
    short: "GUE",
    fullSchoolName: "University of Guelph",
    fullTeamName: "Guelph Gryphons",
  },
  {
    city: "Lakehead",
    teamName: "Thunderwolves",
    short: "LAK",
    fullSchoolName: "Lakehead University",
    fullTeamName: "Lakehead Thunderwolves",
  },
  {
    city: "Laurentian",
    teamName: "Voyageurs",
    short: "LAU",
    fullSchoolName: "Laurentian University",
    fullTeamName: "Laurentian Voyageurs",
  },
  {
    city: "McMaster",
    teamName: "Marauders",
    short: "MAC",
    fullSchoolName: "McMaster University",
    fullTeamName: "McMaster Marauders",
  },
  {
    city: "Nipissing",
    teamName: "Lakers",
    short: "NIP",
    fullSchoolName: "Nipissing University",
    fullTeamName: "Nipissing Lakers",
  },
  {
    city: "Ontario Tech",
    teamName: "Ridgebacks",
    short: "ONT",
    fullSchoolName: "Ontario Tech University",
    fullTeamName: "Ontario Tech Ridgebacks",
  },
  {
    city: "Ottawa",
    teamName: "Gee Gees",
    short: "OTT",
    fullSchoolName: "University of Ottawa",
    fullTeamName: "Ottawa Gee Gees",
  },
  {
    city: "Queens",
    teamName: "Gaels",
    short: "QUE",
    fullSchoolName: "Queen's University",
    fullTeamName: "Queen's Gaels",
  },
  {
    city: "TMUnow",
    teamName: "Bold",
    short: "TMU",
    fullSchoolName: "Toronto Metropolitan University",
    fullTeamName: "TMU Bold",
  },
  {
    city: "Toronto",
    teamName: "Varsity Blues",
    short: "TOR",
    fullSchoolName: "University of Toronto",
    fullTeamName: "Toronto Varsity Blues",
  },
  {
    city: "Western",
    teamName: "Mustangs",
    short: "WES",
    fullSchoolName: "Western University",
    fullTeamName: "Western Mustangs",
  },
  {
    city: "WLUteam",
    teamName: "Golden Hawks",
    short: "WLU",
    fullSchoolName: "Wilfrid Laurier University",
    fullTeamName: "Wilfrid Laurier Golden Hawks",
  },
  {
    city: "Windsor",
    teamName: "Lancers",
    short: "WIN",
    fullSchoolName: "University of Windsor",
    fullTeamName: "Windsor Lancers",
  },
  {
    city: "York",
    teamName: "Lions",
    short: "YOR",
    fullSchoolName: "York University",
    fullTeamName: "York Lions",
  },
  {
    city: "Bishops",
    teamName: "Gaiters",
    short: "BIS",
    fullSchoolName: "Bishop's University",
    fullTeamName: "Bishop's Gaiters",
  },
  {
    city: "Concordia",
    teamName: "Stingers",
    short: "CON",
    fullSchoolName: "Concordia University",
    fullTeamName: "Concordia Stingers",
  },
  {
    city: "Laval",
    teamName: "Rouge et Or",
    short: "LAV",
    fullSchoolName: "Université Laval",
    fullTeamName: "Laval Rouge et Or",
  },
  {
    city: "McGill",
    teamName: "Martlets",
    short: "MCG",
    fullSchoolName: "McGill University",
    fullTeamName: "McGill Martlets",
  },
  {
    city: "UQAM",
    teamName: "Citadins",
    short: "UQA",
    fullSchoolName: "Université du Québec à Montréal",
    fullTeamName: "UQAM Citadins",
  },
];

const { test } = require('./constants.js');

console.log(test)
const fillTeamTable = async () => {
  for (const team of teamNames) {
    console.log(team);
    await knex("teams").insert({
      team_city: team.city,
      team_name: team.teamName,
      team_short: team.short,
      team_school_name: team.fullSchoolName,
      team_fullname: team.fullTeamName,
    });
  }
};

fillTeamTable()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
