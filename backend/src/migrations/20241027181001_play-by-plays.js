export async function up(knex) {
  await knex.schema.createTable("play_by_play", (t) => {
    t.string("play_id").primary(); 
    t.string("game_id").notNullable();
    t.string("season").notNullable();
    t.string("home_team").notNullable();
    t.string("away_team").notNullable();
    t.string("play_actor_team").nullable();
    t.string("play_actor_player").nullable();
    t.string("play_name").nullable();
    t.text("description");
    t.boolean("shot").notNullable().defaultTo(false);
    t.string("shot_result").nullable();
    t.float("shot_quality").nullable();
    t.float("shot_x").nullable();
    t.float("shot_y").nullable();
    t.integer("quarter").notNullable();
    t.integer("clock").nullable();
    t.integer("shotClock").nullable();
    t.index(["game_id", "play_actor_team", "play_actor_player"]);
  });
}

export async function down(knex) {
  await knex.schema.dropTable("play_by_play");
}
