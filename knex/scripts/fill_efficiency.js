import kx from "./config.js";


// done
const player_efficiency = async () => {
  try {
    const player_stats = await kx("player_game_stats");

    const updates = player_stats.map((row) => {
      const fg = row.fg2 + row.fg3;
      const fg_percent = row.fga ? (row.fg2 + row.fg3) / row.fga : null;
      const pt3_percent = row.fga3 ? row.fg3 / row.fga3 : null;
      const pt2_percent = row.fga2 ? row.fg2 / row.fga2 : null;
      const efg_percent = row.fga
        ? (row.fg2 + row.fg3 + 0.5 * row.fg3) / row.fga
        : null;
      const ft_percent = row.fta ? row.ft / row.fta : null;

      return {
        id: row.id,
        fg,
        fg_percent,
        "3pt_percent": pt3_percent,
        "2pt_percent": pt2_percent,
        efg_percent,
        ft_percent,
      };
    });

    for (const update of updates) {
      await kx("player_game_stats").where("id", update.id).update(update);
    }
  } catch (error) {
    console.error("Error updating team game stats:", error);
  }
}

async function team_efficiency() {
  try {
    const team_stats = await kx("team_game_stats");
    const updates = team_stats.map((row) => {
      const fg = row.fg2 + row.fg3;
      const fg_percent = row.fga ? (row.fg2 + row.fg3) / row.fga : null;
      const pt3_percent = row.fga3 ? row.fg3 / row.fga3 : null;
      const pt2_percent = row.fga2 ? row.fg2 / row.fga2 : null;
      const efg_percent = row.fga
        ? (row.fg2 + row.fg3 + 0.5 * row.fg3) / row.fga
        : null;
      const ft_percent = row.fta ? row.ft / row.fta : null;

      return {
        id: row.id,
        fg,
        fg_percent,
        "3pt_percent": pt3_percent,
        "2pt_percent": pt2_percent,
        efg_percent,
        ft_percent,
      };
    });

    for (const update of updates) {
      await kx("team_game_stats").where("id", update.id).update(update);
    }
    console.log("team stats done")
  } catch (error) {
    console.error("Error updating team game stats:", error);
  }
}

player_efficiency();
team_efficiency();
