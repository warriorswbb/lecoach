import kx from "./config.js";

// done
const team_game_stats = async () => {
  try {
    const games = await kx("games").select("game_id", "team_one", "team_two");
    for (const game of games) {
      const gameId = game.game_id;
      const team1 = game.team_one;
      const team2 = game.team_two;

      if (!team1 || !team2) {
        console.error("Missing team data for game", gameId);
        continue;
      }

      const team1_stats = await kx("team_game_stats")
        .where("team_id", team1)
        .andWhere("game_id", gameId)
        .first()
        .select("id");
      const team2_stats = await kx("team_game_stats")
        .where("team_id", team2)
        .andWhere("game_id", gameId)
        .first()
        .select("id");

      const teamOneStatsId = team1_stats ? team1_stats.id : null;
      const teamTwoStatsId = team2_stats ? team2_stats.id : null;

      await kx("games").where("game_id", gameId).update({
        team_one_stats_id: teamOneStatsId,
        team_two_stats_id: teamTwoStatsId,
      });
    }
  } catch (error) {
    console.error("Error updating team game stats:", error);
  }
};

team_game_stats()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
