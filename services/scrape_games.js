import cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";
import { teamNames } from "./constants.js";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";

// https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=Waterloo&SType=statgame

// cron.schedule('* * * * *', () => {
//     console.log('running every second');
// });

const resultFolder = path.resolve("./result");
if (!fs.existsSync(resultFolder)) {
  fs.mkdirSync(resultFolder, { recursive: true });
}

// for now just adjust the year manully since we should only have to do this once
const baseUrl =
  "https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=TEAM_NAME&SType=statgame";

async function fetch_team_data(team) {
  const url = baseUrl.replace("TEAM_NAME", team.city);
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const rows = [];

    $("br").each((index, element) => {
      const text = $(element).get(0).nextSibling.nodeValue;
      if (text) {
        let cleanedText = text.trim().replace(/;/g, ",");
        let cleanerText = cleanedText.trim().replace(/"/g, "");
        rows.push(cleanerText);
      }
    });
    
    if (rows.length === 0) {
      console.error(`No data found for ${team.fullTeamName}`);
    } else {
      const csvPath = path.join(resultFolder, `${team.city}_data.csv`);
      fs.writeFileSync(csvPath, rows.join("\n"), "utf8");
      console.log(`Data for ${team.fullTeamName} written to CSV.`);
    }
  } catch (error) {
    console.error(`Error fetching data for ${team.fullTeamName}:`, error);
  }
}

async function fetch_all_teams_data() {
  const promises = teamNames.map((team) => fetch_team_data(team));
  await Promise.all(promises);
}

fetch_all_teams_data();
