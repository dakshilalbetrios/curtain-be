const configs = require("../../../configs");
const {
  OFFERING_CATEGORIES,
  LEAD_ENGAGEMENT_MODES,
  LEAD_SOURCES,
  REFERRED_BY_TYPES,
  LEAD_STATUS,
  INVOICE_STATUSES,
  PAYMENT_MODES,
  IMAGE_TYPES,
  APPOINTMENT_SERVICE_TYPES,
  APPOINTMENT_STATUS,
  GENDERS,
  PATIENT_TYPES,
  THERAPIST_TYPES,
  CALL_TYPES,
} = require("../../../api/constants/common");

exports.up = async function (knex) {
  // Create organization_skeleton_schema database if it doesn't exist
  await knex.raw(
    `CREATE DATABASE IF NOT EXISTS ${configs.DB_ORG_SKELETON_SCHEMA_NAME}`
  );
  console.log(
    `${configs.DB_ORG_SKELETON_SCHEMA_NAME} created or already exists.`
  );

  // Switch to organization_skeleton_schema database
  await knex.raw(`USE ${configs.DB_ORG_SKELETON_SCHEMA_NAME}`);

  // Create branches table
  await knex.schema.createTable("branches", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table.string("name", 30).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create offerings table
  await knex.schema.createTable("offerings", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table.string("name", 30).notNullable();
    table.string("description", 100);
    table.enum("category", Object.values(OFFERING_CATEGORIES));
    table.decimal("price", 10, 2).notNullable();
    table.decimal("total_sessions", 5, 2).defaultTo(1);
    table.decimal("gst_rate", 5, 2);
    table.boolean("is_gst_inclusive").defaultTo(false);
    table.integer("duration_in_mins");
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create leads table
  await knex.schema.createTable("leads", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table.string("patient_name", 30).notNullable();
    table.string("patient_mobile_no", 15).notNullable();
    table
      .enum("engagement_mode", Object.values(LEAD_ENGAGEMENT_MODES))
      .notNullable();
    table.enum("source", Object.values(LEAD_SOURCES));
    table.string("whatsapp_no", 15);
    table.string("instagram_username", 30);
    table.timestamp("follow_up_date").defaultTo(knex.fn.now());
    table.timestamp("last_contacted_at").defaultTo(knex.fn.now());
    table.timestamp("converted_at").defaultTo(knex.fn.now());
    table.string("referred_by_name", 30);
    table.enum("referred_by_type", Object.values(REFERRED_BY_TYPES));
    table.enum("status", Object.values(LEAD_STATUS)).defaultTo(LEAD_STATUS.NEW);
    table.string("notes", 100);
    table.specificType("assigned_to", "SMALLINT UNSIGNED");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create appointments table
  await knex.schema.createTable("appointments", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table.timestamp("scheduled_datetime").notNullable();
    table.specificType("patient_id", "SMALLINT UNSIGNED");
    table.string("patient_name", 30).notNullable();
    table.string("patient_mobile_no", 15).notNullable();
    table.string("branch_slug", 30).notNullable();
    table.enum("service_type", Object.values(APPOINTMENT_SERVICE_TYPES));
    table.specificType("appointed_to_user_id", "SMALLINT UNSIGNED");
    table.string("notes", 100);
    table.integer("duration_in_mins");
    table
      .enum("status", Object.values(APPOINTMENT_STATUS))
      .defaultTo(APPOINTMENT_STATUS.PENDING);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create patients table
  await knex.schema.createTable("patients", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table.string("first_name", 30).notNullable();
    table.string("last_name", 30);
    table.string("mobile_no", 15).notNullable().unique();
    table.string("email", 50);
    table.enum("gender", Object.values(GENDERS));
    table.date("birth_date");
    table.string("address", 100);
    table.enum("type", Object.values(PATIENT_TYPES)).notNullable();
    table.string("referred_by_name", 30);
    table.enum("referred_by_type", Object.values(REFERRED_BY_TYPES));
    table.timestamp("follow_up_date").defaultTo(knex.fn.now());
    table.string("notes", 100);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);

    // Add FULLTEXT index for search
    table.index(
      ["first_name", "last_name", "mobile_no", "email"],
      "patients_fulltext_search",
      "FULLTEXT"
    );
  });

  // Create complaints table
  await knex.schema.createTable("complaints", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("patient_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("patients");
    table.string("description", 100).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create diagnosis table
  await knex.schema.createTable("diagnosis", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("patient_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("patients");
    table.string("details", 100).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create treatment_suggestions table
  await knex.schema.createTable("treatment_suggestions", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("patient_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("patients");
    table.string("suggestion", 100).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create prescriptions table
  await knex.schema.createTable("prescriptions", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("patient_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("patients");
    table
      .specificType("prescribed_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.timestamp("prescribed_at").defaultTo(knex.fn.now());
    table.string("notes", 200);
    table.string("lab_report", 200);
    table.string("today_procedure", 200);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create prescription_medicines table
  await knex.schema.createTable("prescription_medicines", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("prescription_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("prescriptions");
    table.string("name", 100).notNullable();
    table.string("dosage", 50);
    table.string("when_take", 50);
    table.string("where_take", 50);
    table.string("qty", 20);
    table.string("instruction", 100);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create treatments table
  await knex.schema.createTable("treatments", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("patient_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("patients");
    table
      .specificType("under_observation_doctor_user_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table
      .specificType("therapist_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.enum("therapist_type", Object.values(THERAPIST_TYPES)).notNullable();
    table.string("treatment_name", 100);
    table.string("body_part", 50);
    table.integer("session_number");
    table.string("skin_type", 50);
    table.string("machine_name", 50);
    table.string("machine_starting_reading", 20);
    table.string("machine_ending_reading", 20);
    table.string("power_duration", 50);
    table.string("wavelength", 20);
    table.string("remark", 100);
    table.timestamp("date").defaultTo(knex.fn.now());
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create future_suggestions table
  await knex.schema.createTable("future_suggestions", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("patient_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("patients");
    table.string("suggestion", 100).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create call_logs table
  await knex.schema.createTable("call_logs", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("patient_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("patients");
    table.enum("call_type", Object.values(CALL_TYPES)).notNullable();
    table
      .specificType("call_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.timestamp("call_datetime").defaultTo(knex.fn.now());
    table.string("notes", 100);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create clinic_invoices table
  await knex.schema.createTable("clinic_invoices", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("patient_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("patients");
    table.string("branch_name", 100);
    table
      .specificType("doctor_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table
      .specificType("therapist_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table
      .specificType("counsellor_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.decimal("total_amount", 10, 2).notNullable();
    table.decimal("discount", 10, 2).defaultTo(0);
    table.decimal("gst", 10, 2).defaultTo(0);
    table.decimal("final_amount", 10, 2).notNullable();
    table.decimal("due_amount", 10, 2).notNullable();
    table.decimal("paid_amount", 10, 2).defaultTo(0);
    table.decimal("balance_due", 10, 2).notNullable();
    table
      .enum("invoice_status", Object.values(INVOICE_STATUSES))
      .defaultTo(INVOICE_STATUSES.UNPAID);
    table.timestamp("payment_due_date").defaultTo(knex.fn.now());
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.check("final_amount = (total_amount - discount + gst)");
    table.check("balance_due = (final_amount - paid_amount)");
  });

  // Create clinic_invoice_services table
  await knex.schema.createTable("clinic_invoice_items", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("invoice_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("clinic_invoices");
    table
      .specificType("offering_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("offerings");
    table.string("item_name", 100);
    table.string("item_description", 100);
    table.decimal("total_sessions", 5, 2).defaultTo(0);
    table.decimal("session_number", 5, 2).defaultTo(0);
    table.decimal("unit_price", 10, 2).notNullable();
    table.integer("quantity").defaultTo(1);
    table.decimal("discount", 10, 2).defaultTo(0);
    table.decimal("gst_rate", 5, 2).defaultTo(0);
    table.decimal("final_price", 10, 2).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  await knex.raw(`
  ALTER TABLE clinic_invoice_items
  ADD CONSTRAINT clinic_invoice_items_chk_1
  CHECK (
    final_price = ROUND((((unit_price * quantity) * (1 - (discount / 100))) * (1 + (gst_rate / 100))), 2)
  )
`);

  // Create transactions table
  await knex.schema.createTable("transactions", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("invoice_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("clinic_invoices");
    table
      .specificType("patient_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("patients");
    table.decimal("amount", 10, 2).notNullable();
    table.enum("payment_mode", Object.values(PAYMENT_MODES)).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });

  // Create images table
  await knex.schema.createTable("images", (table) => {
    table
      .specificType("id", "SMALLINT UNSIGNED AUTO_INCREMENT")
      .notNullable()
      .primary();
    table
      .specificType("patient_id", "SMALLINT UNSIGNED")
      .references("id")
      .inTable("patients");
    table.string("image_url", 255).notNullable();
    table.enum("image_type", Object.values(IMAGE_TYPES)).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .specificType("created_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
    table.specificType(
      "updated_at",
      "timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP"
    );
    table
      .specificType("updated_by", "SMALLINT UNSIGNED")
      .references("id")
      .inTable(`${configs.DB_CORE_SCHEMA_NAME}.users`);
  });
};

exports.down = async function (knex) {
  // Switch to organization_skeleton_schema database
  await knex.raw(`USE ${configs.DB_ORG_SKELETON_SCHEMA_NAME}`);

  // Drop tables in reverse order
  const tables = [
    "images",
    "transactions",
    "clinic_invoice_items",
    "clinic_invoices",
    "call_logs",
    "future_suggestions",
    "treatments",
    "prescription_medicines",
    "prescriptions",
    "treatment_suggestions",
    "diagnosis",
    "complaints",
    "patients",
    "appointments",
    "leads",
    "services",
    "branches",
    "offerings",
  ];

  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }
};
