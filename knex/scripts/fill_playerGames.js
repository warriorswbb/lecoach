import cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";
import { teamNames } from "../constants.js";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import kx from "./config.js";

// run this after we have all the games
const baseUrl =
  "https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=TEAM_NAME&SType=statgame";

const cleanTeamName = (teamName) => {
  const teamNameMap = {
    Laurier: "WLUteam",
    "Toronto Metropolitan": "TMUnow",
    "Saint Francis Xavier": "StFX",
  };

  if (teamNameMap[teamName]) {
    teamName = teamNameMap[teamName];
  }
  return teamName.replace(/'/g, "");
};

async function fetch_data(team) {
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

    if (rows.length !== 0) {
      // store in database
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const values = row.split(",");

        const teamCity = cleanTeamName(values[2]);
        const team = await kx("teams").where("team_city", teamCity).first();

        const game_id = values[3];
        const game = await kx("games").where("game_id", game_id).first();

        const playerName = values[4];
        const player = await kx("players")
          .where("player_name", playerName)
          .first();

        if (team && player && !game) {
          const teamId = team.team_id;
          const playerId = player.id;
          const game_id = game_id;

          const fga3 = parseInt(values[9], 10);
          const fga2 = parseInt(values[11], 10);

          // Map the values to the correct columns once we have players table
          const insertData = {
            game_id: game_id,
            player_id: playerId,
            team_id: teamId,
            mins: values[7],
            fg3: values[8],
            fga3: values[9],
            fg2: values[10],
            fga2: values[11],
            fga: fga3 + fga2,
            ft: values[12],
            fta: values[13],
            oreb: values[14],
            dreb: values[15],
            reb: values[16],
            pf: values[17],
            assist: values[18],
            turn: values[19],
            block: values[20],
            steal: values[21],
            points: values[22],
          };

          console.log("Inserting game stats: ", game_id);
          // Insert the parsed data into the database
          await kx("player_game_stats").insert(insertData);
        } else {
          // if (game) {
          //   console.log(`Game already migrated: ${game_id}`);
          //   continue;
          // } else if (!team) {
          //   console.error(`No team found for city: ${teamCity}`);
          // } else {
          //   console.error(`No player found for ${playerName}`);
          // }
        }
      }
    } else {
      console.error(`No data found for ${team.fullTeamName}`);
    }
  } catch (error) {
    console.error(`Error fetching data for ${team.fullTeamName}:`, error);
  }
}

async function fetch_player_games() {
  const promises = teamNames.map((team) => fetch_data(team));
  await Promise.all(promises);
  //   return;
}

fetch_player_games();
