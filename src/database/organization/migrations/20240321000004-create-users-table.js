const configs = require("../../../configs");
const { USER_TYPES, USER_STATUSES } = require("../../../api/constants/common");

exports.up = async function (knex) {
  // Switch to organization database
  await knex.raw(`USE ${configs.DB_ORG_SKELETON_SCHEMA_NAME}`);

  // Create users table
  await knex.schema.createTable("users", (table) => {
    // Primary key
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();

    // Core user relationship
    table
      .specificType("common_user_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);

    // Organization relationship
    table
      .string("organization_id", 30)
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.organizations`)
      .notNullable();

    // Core user fields
    table.string("email", 30);
    table.string("password_hash", 100);
    table.string("first_name", 30);
    table.string("last_name", 30);
    table.string("mobile_no", 15);
    table.enum("type", Object.values(USER_TYPES));
    table.enum("status", Object.values(USER_STATUSES));
    table.timestamp("last_login_at").defaultTo(knex.fn.now());
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.specificType("created_by", "SMALLINT UNSIGNED");
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table.specificType("updated_by", "SMALLINT UNSIGNED");

    // Add FULLTEXT index for search
    table.index(
      ["first_name", "last_name", "mobile_no", "email"],
      "users_fulltext_search",
      "FULLTEXT"
    );
  });
};

exports.down = async function (knex) {
  // Switch to organization database
  await knex.raw(`USE ${configs.DB_ORG_SKELETON_SCHEMA_NAME}`);

  // Drop users table
  await knex.schema.dropTableIfExists("users");
};
