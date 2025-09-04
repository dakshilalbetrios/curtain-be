const knex = require("knex");
const configs = require("../../configs");
const knexConfig = require("./knex/index");
const path = require("path");

knexConfig.migrations = {
  directory: path.join(__dirname, "migrations"),
  tableName: "migrations",
};

/**
 * Get all organization schemas
 * @returns {Promise<string[]>} Array of schema names
 */
async function getOrganizationSchemas() {
  const db = knex(knexConfig);

  try {
    const schemas = await db.raw(`
      SELECT id 
      FROM ${configs.DB_CORE_SCHEMA_NAME}.organizations
    `);
    return [
      ...schemas[0].map((row) => `${row.id}`),
      configs.DB_ORG_SKELETON_SCHEMA_NAME,
    ];
  } finally {
    await db.destroy();
  }
}

/**
 * Get today's migrations for a schema
 * @param {string} schemaName - Name of the schema
 * @returns {Promise<number>} Batch number of today's migrations
 */
async function getTodayBatchNumber(schemaName) {
  const db = knex(knexConfig);
  await db.raw(`USE ${schemaName}`);

  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const todayMigrations = await db("migrations")
      .whereRaw("DATE(migration_time) = ?", [today])
      .orderBy("batch", "desc")
      .first();

    return todayMigrations ? todayMigrations.batch : null;
  } finally {
    await db.destroy();
  }
}

/**
 * Get current migration batch for a schema
 * @param {string} schemaName - Name of the schema
 * @returns {Promise<number>} Current batch number
 */
async function getCurrentBatchNumber(schemaName) {
  const db = knex(knexConfig);
  await db.raw(`USE ${schemaName}`);

  try {
    const currentBatch = await db("migrations")
      .orderBy("batch", "desc")
      .first();

    return currentBatch ? currentBatch.batch : 0;
  } finally {
    await db.destroy();
  }
}

/**
 * Get all migrations for a schema
 * @param {string} schemaName - Name of the schema
 * @returns {Promise<Array>} Array of all migration objects
 */
async function getAllMigrations(schemaName) {
  const db = knex(knexConfig);
  await db.raw(`USE ${schemaName}`);

  try {
    const migrations = await db("migrations")
      .orderBy("batch", "asc")
      .orderBy("id", "asc");

    return migrations;
  } finally {
    await db.destroy();
  }
}

/**
 * Release migration lock for a schema
 * @param {string} schemaName - Name of the schema
 */
async function releaseMigrationLock(schemaName) {
  const db = knex(knexConfig);
  await db.raw(`USE ${schemaName}`);

  try {
    console.log(`==== 🔓 Releasing migration lock for schema: ${schemaName}`);

    // Check if migrations table exists
    const tableExists = await db.schema.hasTable("migrations");
    if (!tableExists) {
      console.log(
        `📝 Migrations table doesn't exist in ${schemaName}, no lock to release`
      );
      return;
    }

    // Try to release the lock by deleting any stale lock records
    // Knex uses a lock table to prevent concurrent migrations
    try {
      await db.raw("DELETE FROM migrations_lock WHERE is_locked = 1");
      console.log(
        `✅ Successfully released migration lock for schema: ${schemaName}`
      );
    } catch (lockError) {
      console.error(lockError);
      // If knex_migrations_lock table doesn't exist, that's fine
      console.log(
        `📝 No migration lock table found in ${schemaName}, lock already released`
      );
    }
  } catch (error) {
    console.error(
      `⚠️  Warning: Could not release migration lock for ${schemaName}:`,
      error.message
    );
  } finally {
    await db.destroy();
  }
}

/**
 * Run migrations for a specific schema
 * @param {string} _schemaName - Name of the schema
 * @param {boolean} _isRollback - Whether to rollback instead of migrate
 * @param {boolean} _isDestroy - Whether to destroy the database
 * @param {string} _rollbackType - Type of rollback: 'latest', 'all', 'today', or batch number
 * @returns {Promise<{afterBatch: number, appliedMigrations: Array}>} The batch number and applied migrations after migration/rollback
 */
async function runSchemaMigration(
  _schemaName,
  _isRollback,
  _isDestroy,
  _rollbackType = "latest"
) {
  const db = knex(knexConfig);
  await db.raw(`USE ${_schemaName}`);

  try {
    if (_isDestroy) {
      console.log(`Destroying ${_schemaName} database...`);
      await db.raw(`DROP DATABASE IF EXISTS ${_schemaName}`);
      console.log(`${_schemaName} database destroyed successfully.`);
      return { afterBatch: 0, appliedMigrations: [] };
    }

    console.log(
      `${_isRollback ? "Rolling back" : "Running"} migrations for schema: ${_schemaName}`
    );

    if (_isRollback) {
      let rollbackTarget;

      switch (_rollbackType) {
        case "all":
          rollbackTarget = 0; // Rollback all migrations
          console.log(`Rolling back ALL migrations for ${_schemaName}`);
          break;
        case "today":
          const todayBatch = await getTodayBatchNumber(_schemaName);
          if (todayBatch) {
            rollbackTarget = todayBatch - 1; // Rollback to before today's batch
            console.log(
              `Rolling back to before today's migrations (batch ${todayBatch}) for ${_schemaName}`
            );
          } else {
            console.log(
              `No migrations found for today in ${_schemaName}, rolling back latest batch`
            );
            rollbackTarget = 1; // Default to latest batch
          }
          break;
        case "latest":
          rollbackTarget = 1; // Rollback latest batch
          console.log(`Rolling back latest batch for ${_schemaName}`);
          break;
        default:
          // Check if it's a number (batch number)
          const batchNum = parseInt(_rollbackType);
          if (!isNaN(batchNum)) {
            rollbackTarget = batchNum;
            console.log(`Rolling back to batch ${batchNum} for ${_schemaName}`);
          } else {
            console.log(
              `Invalid rollback type: ${_rollbackType}, rolling back latest batch for ${_schemaName}`
            );
            rollbackTarget = 1;
          }
      }

      await db.migrate.rollback({}, rollbackTarget);
      return { afterBatch: rollbackTarget, appliedMigrations: [] };
    } else {
      // Get migrations before running new ones
      const migrationsBefore = await getAllMigrations(_schemaName);

      // Run the migrations
      await db.migrate.latest();

      // Get migrations after running new ones
      const migrationsAfter = await getAllMigrations(_schemaName);

      // Calculate which migrations were applied in this session
      const appliedMigrations = migrationsAfter.filter(
        (migration) =>
          !migrationsBefore.some(
            (beforeMigration) => beforeMigration.id === migration.id
          )
      );

      // Get the new batch number after migration
      const currentBatch = await getCurrentBatchNumber(_schemaName);

      return {
        afterBatch: currentBatch,
        appliedMigrations: appliedMigrations,
      };
    }
  } catch (error) {
    console.error(
      `Error ${_isRollback ? "rolling back" : "running"} migrations for schema ${_schemaName}:`,
      error
    );
    throw error;
  } finally {
    await db.destroy();
  }
}

async function runAllSchemaMigrations() {
  const isInit = process.argv.includes("--init");
  const isRollback = process.argv.includes("--rollback");
  const isDestroy = process.argv.includes("--destroy");

  // Parse rollback type from command line arguments
  let rollbackType = "latest";
  const rollbackIndex = process.argv.indexOf("--rollback");
  if (
    rollbackIndex !== -1 &&
    process.argv[rollbackIndex + 1] &&
    !process.argv[rollbackIndex + 1].startsWith("--")
  ) {
    rollbackType = process.argv[rollbackIndex + 1];
  }

  let db;
  const completedSchemas = []; // Track successfully completed schemas for rollback
  const processedSchemas = []; // Track all schemas that were processed (for lock release)

  try {
    if (isInit) {
      console.log("Running initial organization database setup...");
      // Create initial database and tables
      db = knex(knexConfig);

      // Create core database if it doesn't exist
      await db.raw(
        `CREATE DATABASE IF NOT EXISTS ${configs.DB_ORG_SKELETON_SCHEMA_NAME}`
      );

      // Switch to core database
      await db.raw(`USE ${configs.DB_ORG_SKELETON_SCHEMA_NAME}`);

      // Create migrations table
      const migrationsTableExists = await db.schema.hasTable("migrations");
      if (!migrationsTableExists) {
        await db.schema.createTable("migrations", (table) => {
          table.increments("id").primary();
          table.string("name").notNullable();
          table.integer("batch").notNullable();
          table.timestamp("migration_time").defaultTo(db.fn.now());
        });
      }

      console.log(
        "Initial organization database setup completed successfully."
      );
      await db.destroy();
    }

    // Get all organization schemas
    const schemas = await getOrganizationSchemas();

    console.log(
      `Found ${schemas.length} organization schemas: ${schemas.join(", ")}`
    );

    // Run migrations for each schema sequentially (not in parallel)
    for (const schema of schemas) {
      try {
        console.log(`\n--- Processing schema: ${schema} ---`);

        // Track that we're processing this schema
        processedSchemas.push(schema);

        // Get the batch number before migration/rollback
        const beforeBatch = await getCurrentBatchNumber(schema);

        // Run the migration/rollback
        const result = await runSchemaMigration(
          schema,
          isRollback,
          isDestroy,
          rollbackType
        );

        // Track successful completion for potential rollback
        if (!isRollback && !isDestroy) {
          completedSchemas.push({
            schema,
            beforeBatch,
            afterBatch: result.afterBatch,
            appliedMigrations: result.appliedMigrations,
          });

          // Log which migrations were applied
          if (result.appliedMigrations.length > 0) {
            console.log(
              `📝 Applied ${result.appliedMigrations.length} migration(s):`
            );
            result.appliedMigrations.forEach((migration) => {
              console.log(`  - ${migration.name} (batch ${migration.batch})`);
            });
          } else {
            console.log(`📝 No new migrations applied (already up to date)`);
          }
        }

        console.log(
          `✓ Successfully completed ${isRollback ? "rollback" : "migration"} for schema: ${schema}`
        );

        await releaseMigrationLock(schema);

        console.log(`🔓 Releasing migration lock for schema: ${schema}`);
      } catch (error) {
        console.error(`\n❌ ERROR in schema: ${schema}`);
        console.error(`Error details:`, error.message);

        // Release migration lock for the failed schema
        try {
          await releaseMigrationLock(schema);
        } catch (lockError) {
          console.error(
            `⚠️  Warning: Could not release lock for failed schema ${schema}:`,
            lockError.message
          );
        }

        console.error(
          `\nStopping execution. Other schemas will not be processed.`
        );
        console.error(`\nFull error stack:`, error);
        process.exit(1);
      }
    }

    console.log(
      `\n✅ All schema ${isRollback ? "rollbacks" : "migrations"} completed successfully.`
    );
  } catch (error) {
    console.error(
      `Error running organization schema ${isRollback ? "rollbacks" : "migrations"}:`,
      error
    );

    process.exit(1);
  } finally {
    if (db) await db.destroy();
  }
}

runAllSchemaMigrations();
