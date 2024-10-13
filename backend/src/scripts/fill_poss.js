import fs from "fs";
import csv from "csv-parser";
import kx from "./config.js";

// done
// delete =sep the first row in csv

// deprecated to use poss formula instead of using synergy stats
let teams = [];

const updateTeamSeasonStats = async (teams) => {
  for (const team of teams) {
    const teamRecord = await kx("teams")
      .select("team_id")
      .where("team_fullname", team.team)
      .first();

    if (teamRecord) {
      await kx("team_season_stats")
        .where("team_one", teamRecord.team_id)
        .update({
          poss_per_game: team.possessions,
        });
      console.log(`Updated possessions for ${team.team}`);
    } else {
      console.log(`Team not found: ${team.team}`);
    }
  }
};

fs.createReadStream("overall2023.csv")
  .pipe(csv())
  .on("data", (row) => {
    teams.push({
      team: row.Team,
      possessions: parseFloat(row.Poss),
    });
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
    updateTeamSeasonStats(teams);
  });
