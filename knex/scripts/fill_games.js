import cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";
import { teamNames } from "../constants.js";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import kx from "./config.js";

// run this after we have all the games in the database
const baseUrl =
  "https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=TEAM_NAME&SType=gameinfo";

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

const fetch_games = async (team) => {
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

        const teamOne = cleanTeamName(values[6]);
        const teamTwo = cleanTeamName(values[9]);

        const team1 = await kx("teams").where("team_city", teamOne).first();
        const team2 = await kx("teams").where("team_city", teamTwo).first();

        const gameId = values[2];
        const winning_team = values[7] > values[10] ? team1 : team2;
        const overtime = values[12] === "0" ? false : true;

        const gameExists = await kx("games").where("game_id", gameId).first();

        if (!gameExists) {

          const team1Id = team1 ? team1.team_id : null;
          const team2Id = team2 ? team2.team_id : null;

          const insertData = {
            season: values[0],
            // gender: values[1],
            game_id: gameId,
            date: values[3],
            location: values[4],
            team_one: team1Id,
            team_two: team2Id,
            team_one_score: values[7],
            team_two_score: values[10],
            winning_team: winning_team.team_id,
            overtime: overtime,
            comments: values[13],
          };

          // Insert the parsed data into the database
          await kx("games").insert(insertData);
        } else {
          console.log(`Game already exists: ${gameId}`);
        }
      }
    } else {
      console.error(`No data found for ${team.fullTeamName}`);
    }
  } catch (error) {
    console.error(`Error fetching data for ${team.fullTeamName}:`, error);
  }
};

async function fetch_all_games() {
  const promises = teamNames.map((team) => fetch_games(team));
  await Promise.all(promises);
  //   return;
}

fetch_all_games();
