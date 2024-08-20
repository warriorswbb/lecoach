export async function up(knex) {
  await knex.schema.createTable("player_game_stats", (t) => {
    t.increments("id").primary();

    t.string("game_id")

      .unsigned()

      .references("game_id")

      .inTable("games")

      .onDelete("CASCADE");

    t.integer("player_id")

      .unsigned()

      .references("id")

      .inTable("players")

      .onDelete("CASCADE");

    t.integer("team_id")

      .unsigned()

      .references("team_id")

      .inTable("teams")

      .onDelete("CASCADE");

    t.integer("mins").notNullable();

    t.integer("fg3").notNullable();

    t.integer("fga3").notNullable();

    t.integer("fg2").notNullable();

    t.integer("fga2").notNullable();

    t.integer("fga").notNullable();

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

    t.string("game_id")

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

    t.integer("fga3").notNullable();

    t.integer("fg2").notNullable();

    t.integer("fga2").notNullable();

    t.integer("fga").notNullable();

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

    t.float("possessions");

    t.float("offrtg");

    t.float("defrtg");
  });
}

export async function down(knex) {
  await knex.schema.dropTable("player_game_stats");
  await knex.schema.dropTable("team_game_stats");
}
