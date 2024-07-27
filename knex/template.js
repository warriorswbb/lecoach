export async function up(knex) {
    await knex.schema.createTable("", t => {
    });
  }
  
  export async function down(knex) {
    await knex.schema.dropTable("");
  }
  