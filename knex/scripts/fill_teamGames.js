import kx from "./config.js";

// done
async function team_game_stats() {
  try {
    const games = await kx("games").select("game_id", "team_one", "team_two");
    for (const game of games) {
      const gameId = game.game_id;
      const team1 = game.team_one;
      const team2 = game.team_two;
      console.log(gameId, team1, team2);

      const teamOne_name = await kx("teams")
        .select("team_name")
        .where("team_id", team1);
      const teamTwo_name = await kx("teams")
        .select("team_name")
        .where("team_id", team1);

      const teamOne_stats = await kx("player_game_stats")
        .where("game_id", gameId)
        .andWhere("team_id", team1);

      const teamTwo_stats = await kx("player_game_stats")
        .where("game_id", gameId)
        .andWhere("team_id", team2);

      let insertDataOne = {
        game_id: gameId,
        team_id: team1,
        team_name: "null",
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

      let insertDataTwo = {
        game_id: gameId,
        team_id: team2,
        team_name: "null",
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
      teamOne_stats.forEach((stat) => {
        insertDataOne.mins += stat.mins;
        insertDataOne.fg3 += stat.fg3;
        insertDataOne.fga3 += stat.fga3;
        insertDataOne.fg2 += stat.fg2;
        insertDataOne.fga2 += stat.fga2;
        insertDataOne.fga += stat.fga;
        insertDataOne.ft += stat.ft;
        insertDataOne.fta += stat.fta;
        insertDataOne.oreb += stat.oreb;
        insertDataOne.dreb += stat.dreb;
        insertDataOne.reb += stat.reb;
        insertDataOne.pf += stat.pf;
        insertDataOne.assist += stat.assist;
        insertDataOne.turn += stat.turn;
        insertDataOne.block += stat.block;
        insertDataOne.steal += stat.steal;
        insertDataOne.points += stat.points;
      });

      teamTwo_stats.forEach((stat) => {
        insertDataTwo.mins += stat.mins;
        insertDataTwo.fg3 += stat.fg3;
        insertDataTwo.fga3 += stat.fga3;
        insertDataTwo.fg2 += stat.fg2;
        insertDataTwo.fga2 += stat.fga2;
        insertDataTwo.fga += stat.fga;
        insertDataTwo.ft += stat.ft;
        insertDataTwo.fta += stat.fta;
        insertDataTwo.oreb += stat.oreb;
        insertDataTwo.dreb += stat.dreb;
        insertDataTwo.reb += stat.reb;
        insertDataTwo.pf += stat.pf;
        insertDataTwo.assist += stat.assist;
        insertDataTwo.turn += stat.turn;
        insertDataTwo.block += stat.block;
        insertDataTwo.steal += stat.steal;
        insertDataTwo.points += stat.points;
      });

      // // Insert the aggregated data into the 'team_game_stats' table
      await kx("team_game_stats").insert(insertDataOne);
      await kx("team_game_stats").insert(insertDataTwo);
    }
  } catch (error) {
    console.error("Error updating team game stats:", error);
  }
}

team_game_stats();
