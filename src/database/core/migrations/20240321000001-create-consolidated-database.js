exports.up = async function (knex) {
  // Create users table
  await knex.schema.createTable("users", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table.string("name", 100);
    table.string("mobile_no", 15).unique();
    table.string("shop_name", 150);
    table.string("hashed_password", 255);
    table.enum("status", ["ACTIVE", "INACTIVE"]).defaultTo("ACTIVE");
    table.enum("role", ["ADMIN", "SALES", "CUSTOMER"]);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.specificType("created_by", "SMALLINT UNSIGNED");
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table.specificType("updated_by", "SMALLINT UNSIGNED");
  });

  // Create collections table
  await knex.schema.createTable("collections", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table.string("name", 150);
    table.string("description", 255);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
  });

  // Create collections_serial_numbers table
  await knex.schema.createTable("collections_serial_numbers", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("collection_id", "SMALLINT UNSIGNED")
      .notNullable()
      .references("id")
      .inTable("collections");
    table.string("sr_no", 100).unique();
    table.decimal("min_stock", 10, 2);
    table.decimal("max_stock", 10, 2);
    table.decimal("current_stock", 10, 2);
    table.enum("unit", ["mtr", "pcs"]).defaultTo("mtr");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
  });

  // Create collection_sr_no_stock_movements table
  await knex.schema.createTable("collection_sr_no_stock_movements", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("collection_sr_no_id", "SMALLINT UNSIGNED")
      .notNullable()
      .references("id")
      .inTable("collections_serial_numbers");
    table.enum("action", ["IN", "OUT"]);
    table.decimal("quantity", 10, 2);
    table.string("message", 255);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
  });

  // Create orders table
  await knex.schema.createTable("orders", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .enum("status", [
        "PENDING",
        "APPROVED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ])
      .defaultTo("PENDING");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
  });

  // Create order_items table
  await knex.schema.createTable("order_items", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("order_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("orders");
    table
      .specificType("collection_sr_no_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("collections_serial_numbers");
    table.decimal("quantity", 10, 2);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
  });

  // Create customer_collection_access table
  await knex.schema.createTable("customer_collection_access", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("customer_user_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
    table
      .specificType("collection_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("collections");
    table
      .enum("status", ["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "EXPIRED"])
      .defaultTo("ACTIVE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("users");
  });
};

exports.down = async function (knex) {
  // Drop tables in reverse order
  const tables = [
    "customer_collection_access",
    "order_items",
    "orders",
    "collection_sr_no_stock_movements",
    "collections_serial_numbers",
    "collections",
    "users",
  ];

  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }
};
