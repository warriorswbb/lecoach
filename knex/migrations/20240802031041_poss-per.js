export async function up(knex) {
  await knex.schema.table("team_season_stats", (t) => {
    t.float("poss_per_game");
  });
}

export async function down(knex) {
  await knex.schema.table("team_season_stats", (t) => {
    t.dropColumn("poss_per_game");
  });
}
