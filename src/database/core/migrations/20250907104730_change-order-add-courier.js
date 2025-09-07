/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable("orders", (table) => {
    table.string("courier_tracking_no", 25).after("id");
  });

  await knex.schema.alterTable("orders", (table) => {
    table.string("courier_company", 40).after("courier_tracking_no");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable("orders", (table) => {
    table.dropColumn("courier_tracking_no");
    table.dropColumn("courier_company");
  });
};
