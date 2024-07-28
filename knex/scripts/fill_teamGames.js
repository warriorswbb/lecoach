import cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";
import { teamNames } from "../constants.js";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import kx from "./config.js";

async function team_game_stats() {
  try {
    const games = await kx("games").select("game_id");
    for (const game of games) {
      const gameId = game.game_id;

      const stats = await kx("player_game_stats").where("game_id", gameId);

      
      let insertData = {
        game_id: gameId,
        team_id: 0,
        team_name: "",
        mins: 0,
        fg3: 0,
        fga3: 0,
        fg2: 0,
        fga2: 0,
        fga: 0,
        ft: 0,
        fta: 0,
        oreb: 0,
        dreb: 0,
        reb: 0,
        pf: 0,
        assist: 0,
        turn: 0,
        block: 0,
        steal: 0,
        points: 0,
      };

      // Aggregate stats for the current game
      stats.forEach(stat => {
        insertData.team_id = stat.team_id;
        insertData.team_name = stat.team_name;
        insertData.mins += stat.mins;
        insertData.fg3 += stat.fg3;
        insertData.fga3 += stat.fga3;
        insertData.fg2 += stat.fg2;
        insertData.fga2 += stat.fga2;
        insertData.fga += stat.fga;
        insertData.ft += stat.ft;
        insertData.fta += stat.fta;
        insertData.oreb += stat.oreb;
        insertData.dreb += stat.dreb;
        insertData.reb += stat.reb;
        insertData.pf += stat.pf;
        insertData.assist += stat.assist;
        insertData.turn += stat.turn;
        insertData.block += stat.block;
        insertData.steal += stat.steal;
        insertData.points += stat.points;
      });

      // Insert the aggregated data into the 'team_game_stats' table
      await kx("team_game_stats").insert(insertData);
    }
  } catch (error) {
    console.error('Error updating team game stats:', error);
  } finally {
    // Close the database connection if needed
    await kx.destroy();
  }
}

team_game_stats();