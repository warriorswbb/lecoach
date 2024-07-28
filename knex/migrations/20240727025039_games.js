export async function up(knex) {
  await knex.schema.createTable("games", (t) => {
    t.string("game_id").primary();
    t.date("date").notNullable();
    t.string("season").notNullable();
    t.string("location").notNullable();
    t.integer("team_one")
      .unsigned()
      .references("team_id")
      .inTable("teams")
      .onDelete("CASCADE");
    t.integer("team_two")
      .unsigned()
      .references("team_id")
      .inTable("teams")
      .onDelete("CASCADE");
    t.integer("team_one_score").notNullable();
    t.integer("team_two_score").notNullable();
    t.string("winning_team").notNullable();
    t.boolean("overtime").defaultTo(false);
    t.text("comments");
  });
}

export async function down(knex) {
  await knex.schema.dropTable("games");
}
