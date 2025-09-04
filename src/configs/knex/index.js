const config = require("../../configs");
const logger = require("../../utils/logger");
const connection = config.DB_CONFIG;

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

module.exports = {
  client: "mysql2", // Specify the database client
  connection: connection, // Your database connection details
  pool: {
    min: 10, // Minimum number of connections in the pool
    max: 1100, // Maximum number of connections in the pool
    idleTimeoutMillis: 10000, // Time in milliseconds before a connection is considered idle and closed
    acquireTimeoutMillis: 60000, // Time in milliseconds to wait for a connection from the pool before throwing an error
    createTimeoutMillis: 30000, // Time in milliseconds to wait for a new connection to be established
    destroyTimeoutMillis: 30000, // Time in milliseconds to wait for a connection to be destroyed
    reapIntervalMillis: 1000, // Frequency to check for idle connections
    createRetryIntervalMillis: 2000, // Time in milliseconds before retrying to create a connection
    // propagateCreateError: false, // Whether to propagate errors when creating new connections
  },
  // Additional configuration options:
  acquireConnectionTimeout: 100000, // Time in milliseconds to wait for a connection to become available when the pool is full
  log: {
    warn(message) {
      logger.warn(`[Knex warning] ${message}`); // Logging function for warnings
    },
    error(message) {
      logger.error(`[Knex error] ${message}`); // Logging function for errors
    },
    deprecate(message) {
      logger.warn(`[Knex deprecation warning] ${message}`); // Logging function for deprecation warnings
    },
    debug(message) {
      logger.debug(`[Knex debug] ${message}`); // Logging function for debug messages
    },
  },
  asyncStackTraces: true, // Enable stack traces for async operations
  debug: false, // Enable debug mode (useful for troubleshooting) // "knex:*"
  dialectOptions: {
    decimalNumbers: true, // Parse decimal numbers as strings (MySQL specific)
  },
};
