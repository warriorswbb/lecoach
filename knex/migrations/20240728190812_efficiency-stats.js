export async function up(knex) {
  await knex.schema.table("player_game_stats", (t) => {
    t.integer("fg");
    t.float("fg_percent");
    t.float("3pt_percent");
    t.float("2pt_percent");
    t.float("efg_percent");
    t.float("ft_percent");
    t.integer("possessions");
  });

  await knex.schema.table("team_game_stats", (t) => {
    t.integer("fg");
    t.float("fg_percent");
    t.float("3pt_percent");
    t.float("2pt_percent");
    t.float("efg_percent");
    t.float("ft_percent");
  });

  await knex.schema.createTable("team_season_stats", (t) => {
    t.increments("id").primary();
    t.string("season").notNullable();
    t.integer("team_one")
      .unsigned()
      .references("team_id")
      .inTable("teams")
      .onDelete("CASCADE");
    t.integer("games_played");
    t.integer("wins");
    t.integer("mins").notNullable();
    t.integer("fg3").notNullable();
    t.integer("fga3").notNullable();
    t.integer("fg2").notNullable();
    t.integer("fga2").notNullable();
    t.integer("fga").notNullable();
    t.integer("ft").notNullable();
    t.integer("fta").notNullable();
    t.integer("fg");
    t.float("fg_percent");
    t.float("3pt_percent");
    t.float("2pt_percent");
    t.float("efg_percent");
    t.float("ft_percent");
    t.integer("oreb").notNullable();
    t.integer("dreb").notNullable();
    t.integer("reb").notNullable();
    t.integer("pf").notNullable();
    t.integer("assist").notNullable();
    t.integer("turn").notNullable();
    t.integer("block").notNullable();
    t.integer("steal").notNullable();
    t.integer("points").notNullable();
    t.integer("possessions");
  });
}

export async function down(knex) {
  await knex.schema.table("player_game_stats", (t) => {
    t.dropColumn("fg");
    t.dropColumn("fg_percent");
    t.dropColumn("3pt_percent");
    t.dropColumn("2pt_percent");
    t.dropColumn("efg_percent");
    t.dropColumn("ft_percent");
    t.dropColumn("possessions");
  });
  await knex.schema.table("team_game_stats", (t) => {
    t.dropColumn("fg");
    t.dropColumn("fg_percent");
    t.dropColumn("3pt_percent");
    t.dropColumn("2pt_percent");
    t.dropColumn("efg_percent");
    t.dropColumn("ft_percent");
  });
  await knex.schema.dropTable("team_season_stats");
}
