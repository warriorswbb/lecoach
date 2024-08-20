import kx from "./config.js";

// don't count games where stats aren't tracked. run fill_possessions.js again
const fixCounts = async () => {
  try {
    const games = await kx("team_game_stats").select("team_id", "mins");

    for (const game of games) {
      if (!game.mins) {
        console.log("No minutes for game", game);
        await kx("team_season_stats")
          .where({ team_one: game.team_id })
          .update({ games_played: kx.raw("games_played - 1") });
      }
    }

  } catch (error) {
    console.error("Error updating ratings:", error);
  }
};

fixCounts()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
