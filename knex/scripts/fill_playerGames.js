import cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";
import { teamNames } from "../constants.js";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import kx from "./config.js";

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

        const playerName = values[4];
        const player = await kx("players").where("player_name", playerName).first();

        if (team && player) {
          const teamId = team.team_id;
          const playerId = player.id;

          // Map the values to the correct columns once we have players table
          const insertData = {
            // season: values[0],
            // gender: values[1],
            team_id: teamId,
            player_id: playerId,
            game_id: values[3],
            // GP: values[5],
            // GS: values[6],
            mins: values[7],
            fg3: values[8],
            fga3: values[9],
            fg2: values[10],
            fga2: values[11],
            ft: values[12],
            oreb: values[13],
            dreb: values[14],
            reb: values[15],
            pf: values[16],
            assist: values[17],
            turn: values[18],
            block: values[19],
            steal: values[20],
            points: values[21]
          };

          // Insert the parsed data into the database
          await kx("player_game_stats").insert(insertData);
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
//   return;
}

fetch_all_teams_data();
