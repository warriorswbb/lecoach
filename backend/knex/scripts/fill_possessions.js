import kx from "./config.js";

//Poss Formula=0.96*[(Field Goal Attempts)+(Turnovers)+0.44*(Free Throw Attempts)-(Offensive Rebounds)]
const team_poss_game = async () => {
  try {
    const games = await kx("team_game_stats").select(
      "id",
      "fga",
      "turn",
      "fta",
      "oreb"
    );

    for (const game of games) {
      const poss = 0.96 * (game.fga + game.turn + 0.44 * game.fta - game.oreb);
      await kx("team_game_stats")
        .where({ id: game.id })
        .update({ possessions: poss });
    }
  } catch (error) {
    console.error("Error updating team game stats:", error);
  }
};

const updateSeasonPossessions = async () => {
  try {
    const possessionsByTeam = await kx("team_game_stats")
      .select("team_id")
      .sum("possessions as total_poss")
      .groupBy("team_id");

    for (const team of possessionsByTeam) {

      const gamesPlayed = await kx("team_season_stats")
        .select("games_played")
        .where({ team_one: team.team_id });

      // console.log("gamesPlayed", gamesPlayed[0]?.games_played);

      if (team.team_id) {
        await kx("team_season_stats")
          .where({ team_one: team.team_id })
          .update({
            possessions: team.total_poss,
            poss_per_game: team.total_poss / gamesPlayed[0]?.games_played,
          });
      }
    }

    console.info("Team season stats updated successfully.");
  } catch (error) {
    console.error("Error updating team season stats:", error);
  }
};

team_poss_game()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

updateSeasonPossessions()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
