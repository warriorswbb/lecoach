import kx from "./config.js";

// done
//off def rtg formula: https://www.fromtherumbleseat.com/pages/advanced-basketball-statistics-formula-sheet
// pace https://captaincalculator.com/sports/basketball/pace-factor-calculator/
const seasonRatingsPace = async () => {
  try {
    let offRtg_total = 0; // we need to get average to calculate adj rating

    const rtgByTeam = await kx("team_game_stats")
      .select("team_id")
      .sum("defrtg as def_rtg")
      .sum("offrtg as off_rtg")
      .sum("pace as tm_pace")
      .groupBy("team_id");

    for (const team of rtgByTeam) {
      const gamesPlayed = await kx("team_season_stats")
        .select("games_played")
        .where({ team_one: team.team_id });
      if (team.team_id) {
        // console.log(team.tm_pace)
        if (team.team_id === 29) {
          console.log("team", gamesPlayed[0]?.games_played);
        }
        await kx("team_season_stats")
          .where({ team_one: team.team_id })
          .update({
            defrtg: team.def_rtg / gamesPlayed[0]?.games_played,
            offrtg: team.off_rtg / gamesPlayed[0]?.games_played,
            pace: team.tm_pace / gamesPlayed[0]?.games_played,
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
        // adj off and def rtg
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

seasonRatingsPace()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
