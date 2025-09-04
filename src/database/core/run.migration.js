const knexConfig = require("./knex/index");
const knex = require("knex");
const path = require("path");

knexConfig.migrations = {
  directory: path.join(__dirname, "migrations"),
  tableName: "migrations",
};

/**
 * Get today's migrations for database
 * @returns {Promise<number>} Batch number of today's migrations
 */
async function getTodayBatchNumber() {
  const db = knex(knexConfig);

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

async function runMigrations() {
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

  try {
    if (isInit) {
      console.log("🚀 Initializing new curtain business database...");
      // Create initial database and tables
      db = knex(knexConfig);

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

      console.log("✅ Initial database setup completed successfully.");
      await db.destroy();
    }

    if (isDestroy) {
      db = knex(knexConfig);
      console.log("🗑️  Destroying database...");

      console.log("📋 Dropping all tables first to avoid FK errors");
      // Drop all tables in reverse order
      const tables = [
        "customer_collection_access",
        "order_items",
        "orders",
        "collection_sr_no_stock_movements",
        "collections_serial_numbers",
        "collections",
        "users",
        "migrations",
      ];

      for (const table of tables) {
        await db.schema.dropTableIfExists(table);
      }

      console.log("✅ Database destroyed successfully.");
      return;
    }

    console.log(
      isRollback ? "⏪ Running rollback..." : "🚀 Running migrations..."
    );

    db = knex(knexConfig);

    // Run migrations or rollback
    if (isRollback) {
      let rollbackTarget;

      switch (rollbackType) {
        case "all":
          rollbackTarget = 0; // Rollback all migrations
          console.log("⏪ Rolling back ALL migrations");
          break;
        case "today":
          const todayBatch = await getTodayBatchNumber();
          if (todayBatch) {
            rollbackTarget = todayBatch - 1; // Rollback to before today's batch
            console.log(
              `⏪ Rolling back to before today's migrations (batch ${todayBatch})`
            );
          } else {
            console.log(
              "ℹ️  No migrations found for today, rolling back latest batch"
            );
            rollbackTarget = 1; // Default to latest batch
          }
          break;
        case "latest":
          rollbackTarget = 1; // Rollback latest batch
          console.log("⏪ Rolling back latest batch");
          break;
        default:
          // Check if it's a number (batch number)
          const batchNum = parseInt(rollbackType);
          if (!isNaN(batchNum)) {
            rollbackTarget = batchNum;
            console.log(`⏪ Rolling back to batch ${batchNum}`);
          } else {
            console.log(
              `⚠️  Invalid rollback type: ${rollbackType}, rolling back latest batch`
            );
            rollbackTarget = 1;
          }
      }

      await db.migrate.rollback({}, rollbackTarget);
      console.log("✅ Rollback completed successfully");
    } else {
      await db.migrate.latest();
      console.log("✅ Migrations completed successfully");
      console.log("🎉 Your curtain business database is ready!");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    if (db) await db.destroy();
  }
}

runMigrations();
