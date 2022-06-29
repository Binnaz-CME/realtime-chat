/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("messages").del();
  await knex("messages").insert([
    { user: "binnaz", room: "default",message: "hej" },
    { user: "serdar", room: "default",message: "vill du gå till skunk?" },
    { user: "binnaz", room: "default",message: "ja" },
    { user: "serdar", room: "default",message: "ok" },
    { user: "evan", room: "default",message: "någon som vill prata?" },
    { user: "kian", room: "default",message: "ja" },
    { user: "evan", room: "default",message: "i elefant?" },
    { user: "kian", room: "elefant",message: "hej" },
    { user: "evan", room: "elefant",message: "kul" },
    { user: "kian", room: "elefant",message: "vad händer?" },
  ]);
};
