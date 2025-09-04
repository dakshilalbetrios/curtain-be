const config = require("../../../configs");
const connection = config.DB_CONFIG;
const path = require("path");
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

module.exports = {
  client: "mysql2", // Specify the database client
  connection: connection, // Your database connection details
  migrations: {
    directory: path.join(__dirname, "../migrations"),
    tableName: "migrations",
  },
};
