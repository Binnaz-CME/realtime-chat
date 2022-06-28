/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("messages").del();
  await knex("rooms").del();

  await knex("messages").insert([
    { user: "binnaz", room: "apa", message: "hej" },
    { user: "serdar", room: "skunk", message: "hej" },
    { user: "evan", room: "elefant", message: "hej" },
    { user: "kian", room: "saga", message: "hej" },
  ]);

  await knex("rooms").insert([
    { room: "apa" },
    { room: "skunk" },
    { room: "elefant" },
    { room: "saga" },
  ]);
};
