import kx from "./config.js";

// done
//off def rtg formula: https://www.fromtherumbleseat.com/pages/advanced-basketball-statistics-formula-sheet
// pace https://captaincalculator.com/sports/basketball/pace-factor-calculator/
const gameRatingsPace = async () => {
  try {
    const games = await kx("team_game_stats")
      .select("game_id", "team_id", "points", "mins", "possessions")
      .orderBy("game_id");

    // Group games by game_id
    const gameGroups = games.reduce((acc, game) => {
      if (!acc[game.game_id]) {
        acc[game.game_id] = [];
      }
      acc[game.game_id].push(game);
      return acc;
    }, {});

    console.log("length", Object.keys(gameGroups).length);

    // Off Rtg and Def Rtg
    for (const game_id in gameGroups) {
      let [team1, team2] = gameGroups[game_id];

      if (!team1.points && !team2.points) {
        console.log("No points for either team", game_id);
        continue;
      }

      if (!team1.points) {
        team1 = team2;
      }

      if (!team2.points) {
        team2 = team1;
      }

      const gamePoss = team1.possessions + team2.possessions;

      const gamePace = 40 * (gamePoss / (2 * (team1.mins / 5))); // 40 * 5 = 200

      const team1Ortg = (100 / gamePoss) * team1.points;
      const team1Drtg = (100 / gamePoss) * team2.points;

      const team2Ortg = (100 / gamePoss) * team2.points;
      const team2Drtg = (100 / gamePoss) * team1.points;

      await kx("team_game_stats")
        .where({ game_id: game_id, team_id: team1.team_id })
        .update({ offrtg: team1Ortg, defrtg: team1Drtg, pace: gamePace });

      await kx("team_game_stats")
        .where({ game_id: game_id, team_id: team2.team_id })
        .update({ offrtg: team2Ortg, defrtg: team2Drtg, pace: gamePace });
    }
    console.info(
      "Offensive and Defensive Ratings and Pace updated successfully."
    );
  } catch (error) {
    console.error("Error updating ratings:", error);
  }
};

gameRatingsPace()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
