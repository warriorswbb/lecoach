import kx from "./config.js";

// done
const aggregateSeasonStats = async () => {
  try {
    // Get the aggregated stats from team_game_stats, grouped by team_id and season
    const aggregatedStats = await kx("team_game_stats")
      .select(
        "team_id",
        kx.raw("COUNT(id) as games_played"), // Count the number of games for each team
        kx.raw("SUM(mins) as mins"),
        kx.raw("SUM(fg3) as fg3"),
        kx.raw("SUM(fga3) as fga3"),
        kx.raw("SUM(fg2) as fg2"),
        kx.raw("SUM(fga2) as fga2"),
        kx.raw("SUM(fga) as fga"),
        kx.raw("SUM(fg) as fg"),
        kx.raw("SUM(ft) as ft"),
        kx.raw("SUM(fta) as fta"),
        kx.raw("SUM(oreb) as oreb"),
        kx.raw("SUM(dreb) as dreb"),
        kx.raw("SUM(reb) as reb"),
        kx.raw("SUM(pf) as pf"),
        kx.raw("SUM(assist) as assist"),
        kx.raw("SUM(turn) as turn"),
        kx.raw("SUM(block) as block"),
        kx.raw("SUM(steal) as steal"),
        kx.raw("SUM(points) as points"),
        kx.raw("SUM(possessions) as possessions"),
        kx.raw("SUM(fg) / NULLIF(SUM(fga), 0) as fg_percent"),
        kx.raw(`SUM(fg3) / NULLIF(SUM(fga3), 0) as "3pt_percent"`), // Quote the alias
        kx.raw(`SUM(fg2) / NULLIF(SUM(fga2), 0) as "2pt_percent"`), // Quote the alias
        kx.raw(
          `(SUM(fg2) + SUM(fg3) + 0.5 * SUM(fg3)) / NULLIF(SUM(fga), 0) as efg_percent`
        ),
        kx.raw("SUM(ft) / NULLIF(SUM(fta), 0) as ft_percent")
      )
      .where("game_id", "like", "W202%")
      .andWhere("team_id", "is not", null)
      .groupBy("team_id")
      .orderBy("team_id");

    console.log(aggregatedStats);
    // Insert or update the aggregated stats into the team_season_stats table
    for (const stats of aggregatedStats) {
      await kx("team_season_stats")
        .insert({
          season: "2023-2024",
          team_one: stats.team_id,
          games_played: stats.games_played,
          mins: stats.mins,
          fg3: stats.fg3,
          fga3: stats.fga3,
          fg2: stats.fg2,
          fga2: stats.fga2,
          fga: stats.fga,
          fg: stats.fg,
          ft: stats.ft,
          fta: stats.fta,
          oreb: stats.oreb,
          dreb: stats.dreb,
          reb: stats.reb,
          pf: stats.pf,
          assist: stats.assist,
          turn: stats.turn,
          block: stats.block,
          steal: stats.steal,
          points: stats.points,
          possessions: stats.possessions,
          fg_percent: stats.fg_percent,
          "3pt_percent": stats["3pt_percent"],
          "2pt_percent": stats["2pt_percent"],
          efg_percent: stats.efg_percent,
          ft_percent: stats.ft_percent,
        })
    }
  } catch (error) {
    console.error("Error aggregating team stats by season:", error);
  }
};

aggregateSeasonStats()
  .then(() => {
    console.info("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
