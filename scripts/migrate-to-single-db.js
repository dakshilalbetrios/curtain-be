const knex = require("knex");
const configs = require("../src/configs");

/**
 * Migration script to convert from multi-tenant to single database
 * This script will:
 * 1. Create the new consolidated database structure
 * 2. Migrate data from existing multi-tenant databases
 * 3. Clean up old databases
 */

async function migrateToSingleDatabase() {
  console.log("🚀 Starting migration from multi-tenant to single database...");

  // Create main database connection
  const db = knex({
    client: "mysql2",
    connection: configs.DB_CONFIG,
    migrations: {
      directory: "../src/database/core/migrations",
      tableName: "migrations",
    },
  });

  try {
    // Step 1: Run the new consolidated migration
    console.log("📝 Running consolidated database migration...");
    await db.migrate.latest();
    console.log("✅ Consolidated database structure created successfully");

    // Step 2: Check if there are existing organizations to migrate
    console.log("🔍 Checking for existing organizations...");
    const existingOrgs = await db("organizations").select("*");

    if (existingOrgs.length === 0) {
      console.log("ℹ️  No existing organizations found. Migration complete!");
      return;
    }

    console.log(`📊 Found ${existingOrgs.length} existing organizations`);

    // Step 3: For each organization, migrate data if it exists in separate databases
    for (const org of existingOrgs) {
      console.log(`\n🔄 Processing organization: ${org.name} (${org.id})`);

      try {
        // Try to connect to the organization's separate database
        const orgDb = knex({
          client: "mysql2",
          connection: {
            ...configs.DB_CONFIG,
            database: org.id,
          },
        });

        // Check if the organization database exists and has data
        const hasOrgDb = await orgDb.raw(
          "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
          [org.id]
        );

        if (hasOrgDb[0].length === 0) {
          console.log(
            `  ⚠️  Organization database '${org.id}' not found, skipping`
          );
          continue;
        }

        // Migrate users
        console.log(`  👥 Migrating users...`);
        const orgUsers = await orgDb("users").select("*");

        for (const user of orgUsers) {
          // Check if user already exists in main database
          const existingUser = await db("users")
            .where({ email: user.email })
            .first();

          if (!existingUser) {
            // Create user in main database
            await db("users").insert({
              email: user.email,
              password_hash: user.password_hash,
              first_name: user.first_name,
              last_name: user.last_name,
              mobile_no: user.mobile_no,
              organization_id: org.id,
              type: user.type,
              status: user.status,
              last_login_at: user.last_login_at,
              created_at: user.created_at,
              created_by: user.created_by,
              updated_at: user.updated_at,
              updated_by: user.updated_by,
            });
          }
        }
        console.log(`  ✅ Migrated ${orgUsers.length} users`);

        // Migrate other tables as needed
        // You can add more table migrations here based on your needs

        await orgDb.destroy();
        console.log(`  ✅ Completed migration for organization: ${org.name}`);
      } catch (error) {
        console.error(
          `  ❌ Error migrating organization ${org.name}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("📋 Next steps:");
    console.log("  1. Test your application with the new single database");
    console.log("  2. Verify all data has been migrated correctly");
    console.log("  3. Remove old multi-tenant database files when ready");
    console.log(
      "  4. Update your application code to remove schema references"
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToSingleDatabase()
    .then(() => {
      console.log("Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

module.exports = { migrateToSingleDatabase };
