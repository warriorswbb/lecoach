import cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";
import { teamNames } from "../constants.js";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import kx from "./config.js";

// done
const baseUrl =
  "https://usportshoops.ca/history/yangstats.php?Gender=WBB&Season=2023-24&Team=TEAM_NAME&SType=statgame";

async function fetch_players(team) {
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
      } else {
        console.log("No text found for ", team.city);
      }
    });
    const teamdb = await kx("teams").where("team_city", team.city).first();
    if (rows.length !== 0) {
      // store in database
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const values = row.split(",");
        // console.log(values)
        if (teamdb) {
          const teamId = teamdb.team_id;
          const playerName = values[4];

          if (playerName.startsWith("team-")) {
            console.log(`Skipping team name: ${playerName}`);
            continue; // edge case for unknown player names
          }

          // Split player name into first name and last name
          const [firstName, ...lastNameParts] = playerName.split(" ");
          const lastName = lastNameParts.join(" ");

          // Insert or find the player in the database
          let player = await kx("players")
            .where("player_name", playerName)
            .first();
          if (!player) {
            console.log("adding ", playerName);
            await kx("players")
              .insert({
                first_name: firstName,
                last_name: lastName,
                player_name: playerName,
                team_id: teamId,
              })
              .returning("*");
          } else {
            // console.log("Player already exists: ", playerName);
            continue;
          }
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

async function fetch_all_players() {
  const promises = teamNames.map((team) => {
    fetch_players(team);
    console.log("fetching ", team.city);
  });
  await Promise.all(promises);
}

fetch_all_players();
