// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

const path = require('path')

module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: path.join(__dirname, './db.sqlite'),
    },
    migrations: {
      tableName: "knex_migrations",
    },
    useNullAsDefault: true,
  },
};
