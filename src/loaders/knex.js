const knex = require("knex");
const { attachOnDuplicateUpdate } = require("knex-on-duplicate-update");
const knexConfig = require("../configs/knex");
const logger = require("../utils/logger");

// Initialize Knex instance with connection pooling
const knexInstance = knex(knexConfig);

// Attach onDuplicateUpdate functionality
attachOnDuplicateUpdate();

// Test database connection
knexInstance
  .raw("SELECT 1")
  .then(() => {
    logger.info("Database connection established successfully.");
  })
  .catch((error) => {
    logger.error("Failed to establish database connection:", error);
    // logger.error("Failed to establish database connection:", error);
    process.exit(1);
  });

// Graceful shutdown handler
process.on("SIGTERM", async () => {
  try {
    await knexInstance.destroy();
    logger.info("Database connection closed gracefully.");
  } catch (error) {
    logger.error("Error closing database connection:", error);
  } finally {
    process.exit(0);
  }
});

module.exports = knexInstance;
