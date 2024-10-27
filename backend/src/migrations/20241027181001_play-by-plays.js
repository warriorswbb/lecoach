export async function up(knex) {
  await knex.schema.createTable("play_by_play", (t) => {
    t.increments("play_id").primary();
    t.string("game_id").notNullable();
    t.string("home_team").notNullable();
    t.string("away_team").notNullable();
    t.string("play_actor_team").notNullable();
    t.string("play_actor_player").notNullable();
    t.string("play_name").notNullable();
    t.text("description");
    t.boolean("shot").notNullable().defaultTo(false);
    t.boolean("shot_result").nullable();
    t.integer("shot_quality").nullable();
    t.float("shot_x").nullable();
    t.float("shot_y").nullable();
    t.integer("quarter").notNullable();
    t.time("clock").notNullable();
    t.index(["game_id", "play_actor_team", "play_actor_player"]);
  });
}

export async function down(knex) {
  await knex.schema.dropTable("play_by_play");
}
