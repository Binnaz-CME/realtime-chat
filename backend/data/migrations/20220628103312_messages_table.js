/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("messages", (table) => {
    table.increments("id");
    table.string("user").notNullable();
    table.string("room").notNullable();
    table.string("message").notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("rooms", (table) => {
    table.increments("id");
    table.string("room").unique().notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("messages")
    .dropTableIfExists("rooms");
};
