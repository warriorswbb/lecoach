export async function up(knex) {
  await knex.schema.table("games", (t) => {
    t.integer("team_one_stats_id")
      .nullable()
      .references("id")
      .inTable("team_game_stats")
      .onDelete("SET NULL")
      .onUpdate("CASCADE")
      .index();

    t.integer("team_two_stats_id")
      .nullable()
      .references("id")
      .inTable("team_game_stats")
      .onDelete("SET NULL")
      .onUpdate("CASCADE")
      .index();
  });
}

export async function down(knex) {
  await knex.schema.table("games", (t) => {
    t.dropColumn("team_one_stats_id");
    t.dropColumn("team_two_stats_id");
  });
}
