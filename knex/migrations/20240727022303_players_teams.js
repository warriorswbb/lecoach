/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("teams", (t) => {
    t.increments("team_id").primary();
    t.string("team_city").notNullable();
    t.string("team_name").notNullable();
    t.string("team_short").notNullable();
    t.string("team_school_name").notNullable();
    t.string("team_fullname").notNullable();
  });

  await knex.schema.createTable("players", (t) => {
    t.increments("id").primary();
    t.string("first_name").notNullable();
    t.string("last_name").notNullable();
    t.string("player_name").notNullable();
    t.integer("team_id").references("team_id").inTable("teams");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("players");
  await knex.schema.dropTable("teams");
};
