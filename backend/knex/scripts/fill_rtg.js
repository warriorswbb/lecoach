import kx from "./config.js";

//off def rtg formula: https://www.fromtherumbleseat.com/pages/advanced-basketball-statistics-formula-sheet
const calculateRatings = async () => {
  try {
    const games = await kx("team_game_stats")
      .select("game_id", "team_id", "points", "possessions")
      .orderBy("game_id");

    const gameGroups = games.reduce((acc, game) => {
      if (!acc[game.game_id]) {
        acc[game.game_id] = [];
      }
      acc[game.game_id].push(game);
      return acc;
    }, {});

    // loop through each game group and calculate OR and DR
    for (const game_id in gameGroups) {
      let [team1, team2] = gameGroups[game_id];
      //   console.log("team1", team1, "team2", team2);
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

      const team1Ortg = (100 / gamePoss) * team1.points;
      const team1Drtg = (100 / gamePoss) * team2.points;

      const team2Ortg = (100 / gamePoss) * team2.points;
      const team2Drtg = (100 / gamePoss) * team1.points;

      await kx("team_game_stats")
        .where({ game_id: game_id, team_id: team1.team_id })
        .update({ offrtg: team1Ortg, defrtg: team1Drtg });

      await kx("team_game_stats")
        .where({ game_id: game_id, team_id: team2.team_id })
        .update({ offrtg: team2Ortg, defrtg: team2Drtg });
    }
    console.info("Offensive and Defensive Ratings updated successfully.");
  } catch (error) {
    console.error("Error updating ratings:", error);
  }
};

const adjRatings = async () => {
  try {
    let offRtg_total = 0; // we need to get average to calculate adj rating

    const rtgByTeam = await kx("team_game_stats")
      .select("team_id")
      .sum("defrtg as def_rtg")
      .sum("offrtg as off_rtg")
      .groupBy("team_id");

    for (const team of rtgByTeam) {
      const gamesPlayed = await kx("team_season_stats")
        .select("games_played")
        .where({ team_one: team.team_id });
      if (team.team_id) {
        await kx("team_season_stats")
          .where({ team_one: team.team_id })
          .update({
            defrtg: team.def_rtg / gamesPlayed[0]?.games_played,
            offrtg: team.off_rtg / gamesPlayed[0]?.games_played,
          });

        offRtg_total += team.off_rtg / gamesPlayed[0]?.games_played;
      }
    }

    const avgOffRtg = offRtg_total / 48; // 48 teams in league
    console.log("avgOffRtg", avgOffRtg);

    for (const team of rtgByTeam) {
      const gamesPlayed = await kx("team_season_stats")
        .select("games_played")
        .where({ team_one: team.team_id });

      if (team.team_id) {
        const offAdj = team.off_rtg / gamesPlayed[0]?.games_played - avgOffRtg;
        const defAdj = avgOffRtg - team.def_rtg / gamesPlayed[0]?.games_played;

        await kx("team_season_stats").where({ team_one: team.team_id }).update({
          defrtg_adj: defAdj,
          offrtg_adj: offAdj,
        });
      }
    }

    console.info("Team season stats updated successfully.");
  } catch (error) {
    console.error("Error updating team season stats:", error);
  }
};

calculateRatings()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

adjRatings()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
