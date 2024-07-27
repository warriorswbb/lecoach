/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("games", (t) => {
    t.increments("game_id").primary();
    t.date("date").notNullable();
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
    t.string("winning_team").notNullable();
    t.string("losing_team").notNullable();
    t.boolean("overtime").defaultTo(false);
    t.text("comments");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("games");
};
