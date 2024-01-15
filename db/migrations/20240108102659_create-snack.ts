import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("snacks", (table) => {
    table.uuid("id").primary();
    table.text("title").notNullable();
    table.text("description").notNullable();
    table.uuid("user_id").index();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.boolean("diet").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("snacks");
}
