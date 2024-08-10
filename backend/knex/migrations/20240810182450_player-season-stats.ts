import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("player_season_stats", (t) => {
    t.increments("id").primary();
    t.string("season").notNullable();
    t.integer("team_id")
      .unsigned()
      .references("team_id")
      .inTable("teams")
      .onDelete("CASCADE");
    t.integer("player_id")
      .unsigned()
      .references("id")
      .inTable("players")
      .onDelete("CASCADE");
    t.integer("games_played");
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

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("player_season_stats");
}
