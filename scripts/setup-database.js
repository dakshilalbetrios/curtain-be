#!/usr/bin/env node

const knex = require("knex");
const configs = require("../src/configs");

/**
 * 🎉 Simple Database Setup Script for Curtain Business
 * This script will create your database and all tables in one go!
 */

async function setupDatabase() {
  console.log("🎭 Welcome to Curtain Business Database Setup!");
  console.log("==============================================\n");

  // Check if database config exists
  if (!configs.DB_CONFIG) {
    console.error("❌ Database configuration not found!");
    console.error("Please check your .env file and configs/index.js");
    process.exit(1);
  }

  console.log("📋 Database Configuration:");
  console.log(`   Host: ${configs.DB_CONFIG.host}`);
  console.log(`   Port: ${configs.DB_CONFIG.port}`);
  console.log(`   User: ${configs.DB_CONFIG.user}`);
  console.log(`   Database: ${configs.DB_CONFIG.database}`);
  console.log("");

  // Create database connection
  const db = knex({
    client: "mysql2",
    connection: {
      ...configs.DB_CONFIG,
      database: undefined, // Don't specify database initially
    },
  });

  try {
    // Step 1: Create database if it doesn't exist
    console.log("🚀 Step 1: Creating database...");
    await db.raw(
      `CREATE DATABASE IF NOT EXISTS \`${configs.DB_CONFIG.database}\``
    );
    console.log(
      `✅ Database '${configs.DB_CONFIG.database}' created/verified successfully!`
    );

    // Step 2: Switch to the database
    console.log("\n🔄 Step 2: Switching to database...");
    await db.raw(`USE \`${configs.DB_CONFIG.database}\``);
    console.log("✅ Switched to database successfully!");

    // Step 3: Create migrations table
    console.log("\n📝 Step 3: Setting up migrations...");
    const migrationsTableExists = await db.schema.hasTable("migrations");
    if (!migrationsTableExists) {
      await db.schema.createTable("migrations", (table) => {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.integer("batch").notNullable();
        table.timestamp("migration_time").defaultTo(db.fn.now());
      });
      console.log("✅ Migrations table created successfully!");
    } else {
      console.log("✅ Migrations table already exists!");
    }

    // Step 4: Run the migration
    console.log("\n🏗️  Step 4: Creating business tables...");

    // Import and run the migration
    const migration = require("../src/database/core/migrations/20240321000001-create-consolidated-database.js");
    await migration.up(db);

    console.log("✅ All business tables created successfully!");

    // Step 5: Show what was created
    console.log("\n📊 Database Structure Created:");
    console.log("   ✅ users - User management (Admin, Sales, Customer)");
    console.log("   ✅ collections - Product collections");
    console.log(
      "   ✅ collections_serial_numbers - Product inventory with serial numbers"
    );
    console.log(
      "   ✅ collection_sr_no_stock_movements - Stock movement tracking"
    );
    console.log("   ✅ orders - Customer orders");
    console.log("   ✅ order_items - Order line items");
    console.log("   ✅ customer_collection_access - Customer access control");

    console.log(
      "\n🎉 Congratulations! Your curtain business database is ready!"
    );
    console.log("\n📋 Next Steps:");
    console.log("   1. Test your application");
    console.log("   2. Add some sample data");
    console.log("   3. Start building your curtain business!");
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("   1. Check your database connection settings");
    console.error("   2. Ensure MySQL is running");
    console.error("   3. Verify database user has CREATE privileges");
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log("\n✨ Setup completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Setup failed:", error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
