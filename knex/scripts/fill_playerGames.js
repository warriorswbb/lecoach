import cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";
import { teamNames } from "./constants.js";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import kx from "./config.js";

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
    console.log(rows);
    if (rows.length !== 0) {
      // store in database
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const values = row.split(",");
        const teamCity = values[2];
        const team = await kx("teams").where("team_city", teamCity).first();

        if (team) {
          const teamId = team.team_id;

          // Map the values to the correct columns once we have players table
          const insertData = {
            season: values[0],
            gender: values[1],
            team_id: teamId,
            mins: values[3],
            fg3: values[4],
            fga: values[5],
            fg2: values[6],
            fga2: values[7],
            ft: values[8],
            fta: values[9],
            oreb: values[10],
            dreb: values[11],
            reb: values[12],
            pf: values[13],
            assist: values[14],
            turn: values[15],
            block: values[16],
            steal: values[17],
            points: values[18],
          };

          // Insert the parsed data into the database
          await db("player_game_stats").insert(insertData);
        } else {
          console.error(`No team found for city: ${teamCity}`);
        }
      }
    } else {
      console.error(`No data found for ${team.fullTeamName}`);
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
