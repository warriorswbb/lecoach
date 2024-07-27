/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("player_game_stats", (t) => {
    t.integer("game_id")
      .unsigned()
      .references("game_id")
      .inTable("games")
      .onDelete("CASCADE");
    t.integer("player_id")
      .unsigned()
      .references("id")
      .inTable("players")
      .onDelete("CASCADE");
    t.primary(["game_id", "player_id"]);
    t.integer("team_id")
      .unsigned()
      .references("team_id")
      .inTable("teams")
      .onDelete("CASCADE");
    t.integer("mins").notNullable();
    t.integer("fg3").notNullable();
    t.integer("fga").notNullable();
    t.integer("fg2").notNullable();
    t.integer("fga2").notNullable();
    t.integer("ft").notNullable();
    t.integer("fta").notNullable();
    t.integer("oreb").notNullable();
    t.integer("dreb").notNullable();
    t.integer("reb").notNullable();
    t.integer("pf").notNullable();
    t.integer("assist").notNullable();
    t.integer("turn").notNullable();
    t.integer("block").notNullable();
    t.integer("steal").notNullable();
    t.integer("points").notNullable();
  });

  await knex.schema.createTable("team_game_stats", (t) => {
    t.increments("id").primary();
    t.integer("game_id")
      .unsigned()
      .references("game_id")
      .inTable("games")
      .onDelete("CASCADE");
    t.integer("team_id")
      .unsigned()
      .references("team_id")
      .inTable("teams")
      .onDelete("CASCADE");
    t.string("team_name").notNullable();
    t.integer("mins").notNullable();
    t.integer("fg3").notNullable();
    t.integer("fga").notNullable();
    t.integer("fg2").notNullable();
    t.integer("fga2").notNullable();
    t.integer("ft").notNullable();
    t.integer("fta").notNullable();
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

  await knex.schema.table("games", (t) => {
    t.integer("team_one_stat_id")
      .unsigned()
      .references("id")
      .inTable("team_game_stats")
      .onDelete("CASCADE");
    t.integer("team_two_stat_id")
      .unsigned()
      .references("id")
      .inTable("team_game_stats")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("player_game_stats");
  await knex.schema.dropTable("team_game_stats");
  await knex.schema.table("games", (t) => {
    t.dropColumn("team_one_stat_id");
    t.dropColumn("team_two_stat_id");
  });
};
