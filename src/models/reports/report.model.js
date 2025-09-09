const BaseModel = require("../base/base.model");
const knex = require("../../loaders/knex");

class ReportModel extends BaseModel {
  constructor() {
    const fieldMappings = [];
    const tableColumns = [];
    super("reports", fieldMappings, tableColumns);
  }

  /**
   * Get customer collection order analytics
   * @param {Object} options - Query options
   * @param {Object} options.trx - Transaction object
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @returns {Array} Customer collection order data
   */
  async getCustomerCollectionOrderAnalytics({
    trx = null,
    startDate,
    endDate,
  }) {
    const query = trx || knex;

    let baseQuery = query
      .select([
        "u.id as customer_id",
        "u.name as customer_name",
        "u.mobile_no as customer_mobile",
        "c.id as collection_id",
        "c.name as collection_name",
        "c.description as collection_description",
        knex.raw("COUNT(DISTINCT o.id) as total_orders"),
        knex.raw("SUM(oi.quantity) as total_quantity_ordered"),
        knex.raw(
          "COUNT(DISTINCT oi.collection_sr_no_id) as unique_serial_numbers_ordered"
        ),
      ])
      .from("users as u")
      .innerJoin(
        "customer_collection_access as cca",
        "u.id",
        "cca.customer_user_id"
      )
      .innerJoin("collections as c", "cca.collection_id", "c.id")
      .leftJoin("orders as o", "u.id", "o.created_by")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin(
        "collections_serial_numbers as csn",
        "oi.collection_sr_no_id",
        "csn.id"
      )
      .where("u.role", "CUSTOMER")
      .where("cca.status", "ACTIVE")
      .where("o.status", "!=", "CANCELLED")
      .where("csn.collection_id", "=", knex.raw("c.id"))
      .groupBy([
        "u.id",
        "u.name",
        "u.mobile_no",
        "c.id",
        "c.name",
        "c.description",
      ]);

    // Apply date filters if provided
    if (startDate) {
      baseQuery = baseQuery.where("o.created_at", ">=", startDate);
    }
    if (endDate) {
      baseQuery = baseQuery.where("o.created_at", "<=", endDate);
    }

    return await baseQuery.orderBy("u.name").orderBy("c.name");
  }

  /**
   * Get most ordered serial numbers from collections
   * @param {Object} options - Query options
   * @param {Object} options.trx - Transaction object
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @param {number} options.limit - Limit results
   * @returns {Array} Most ordered serial numbers data
   */
  async getMostOrderedSerialNumbers({
    trx = null,
    startDate,
    endDate,
    limit = 50,
  }) {
    const query = trx || knex;

    let baseQuery = query
      .select([
        "csn.id as serial_number_id",
        "csn.sr_no as serial_number",
        "c.id as collection_id",
        "c.name as collection_name",
        "c.description as collection_description",
        "csn.unit",
        knex.raw("COUNT(DISTINCT o.id) as total_orders"),
        knex.raw("SUM(oi.quantity) as total_quantity_ordered"),
        knex.raw("COUNT(DISTINCT o.created_by) as unique_customers"),
        knex.raw("AVG(oi.quantity) as avg_quantity_per_order"),
        knex.raw("MAX(oi.quantity) as max_quantity_ordered"),
        knex.raw("MIN(oi.quantity) as min_quantity_ordered"),
      ])
      .from("collections_serial_numbers as csn")
      .innerJoin("collections as c", "csn.collection_id", "c.id")
      .innerJoin("order_items as oi", "csn.id", "oi.collection_sr_no_id")
      .innerJoin("orders as o", "oi.order_id", "o.id")
      .where("o.status", "!=", "CANCELLED")
      .groupBy([
        "csn.id",
        "csn.sr_no",
        "c.id",
        "c.name",
        "c.description",
        "csn.unit",
      ]);

    // Apply date filters if provided
    if (startDate) {
      baseQuery = baseQuery.where("o.created_at", ">=", startDate);
    }
    if (endDate) {
      baseQuery = baseQuery.where("o.created_at", "<=", endDate);
    }

    return await baseQuery
      .orderBy("total_quantity_ordered", "desc")
      .orderBy("total_orders", "desc")
      .limit(limit);
  }

  /**
   * Get customer order summary
   * @param {Object} options - Query options
   * @param {Object} options.trx - Transaction object
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @returns {Array} Customer order summary data
   */
  async getCustomerOrderSummary({ trx = null, startDate, endDate }) {
    const query = trx || knex;

    let baseQuery = query
      .select([
        "u.id as customer_id",
        "u.name as customer_name",
        "u.mobile_no as customer_mobile",
        knex.raw("COUNT(DISTINCT o.id) as total_orders"),
        knex.raw(
          "COUNT(DISTINCT oi.collection_sr_no_id) as unique_products_ordered"
        ),
        knex.raw("SUM(oi.quantity) as total_quantity_ordered"),
        knex.raw("COUNT(DISTINCT c.id) as unique_collections_ordered"),
        knex.raw("AVG(oi.quantity) as avg_quantity_per_item"),
        knex.raw("MAX(o.created_at) as last_order_date"),
        knex.raw("MIN(o.created_at) as first_order_date"),
      ])
      .from("users as u")
      .innerJoin("orders as o", "u.id", "o.created_by")
      .innerJoin("order_items as oi", "o.id", "oi.order_id")
      .innerJoin(
        "collections_serial_numbers as csn",
        "oi.collection_sr_no_id",
        "csn.id"
      )
      .innerJoin("collections as c", "csn.collection_id", "c.id")
      .where("u.role", "CUSTOMER")
      .where("o.status", "!=", "CANCELLED")
      .groupBy(["u.id", "u.name", "u.mobile_no"]);

    // Apply date filters if provided
    if (startDate) {
      baseQuery = baseQuery.where("o.created_at", ">=", startDate);
    }
    if (endDate) {
      baseQuery = baseQuery.where("o.created_at", "<=", endDate);
    }

    return await baseQuery.orderBy("total_orders", "desc").orderBy("u.name");
  }

  /**
   * Get collection performance analytics
   * @param {Object} options - Query options
   * @param {Object} options.trx - Transaction object
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @returns {Array} Collection performance data
   */
  async getCollectionPerformanceAnalytics({ trx = null, startDate, endDate }) {
    const query = trx || knex;

    let baseQuery = query
      .select([
        "c.id as collection_id",
        "c.name as collection_name",
        "c.description as collection_description",
        knex.raw("COUNT(DISTINCT csn.id) as total_serial_numbers"),
        knex.raw("COUNT(DISTINCT o.id) as total_orders"),
        knex.raw("COUNT(DISTINCT o.created_by) as unique_customers"),
        knex.raw("SUM(oi.quantity) as total_quantity_ordered"),
        knex.raw(
          "COUNT(DISTINCT oi.collection_sr_no_id) as active_serial_numbers"
        ),
        knex.raw("AVG(oi.quantity) as avg_quantity_per_order"),
      ])
      .from("collections as c")
      .leftJoin(
        "collections_serial_numbers as csn",
        "c.id",
        "csn.collection_id"
      )
      .leftJoin("order_items as oi", "csn.id", "oi.collection_sr_no_id")
      .leftJoin("orders as o", "oi.order_id", "o.id")
      .where("o.status", "!=", "CANCELLED")
      .orWhereNull("o.status")
      .groupBy(["c.id", "c.name", "c.description"]);

    // Apply date filters if provided
    if (startDate) {
      baseQuery = baseQuery.where("o.created_at", ">=", startDate);
    }
    if (endDate) {
      baseQuery = baseQuery.where("o.created_at", "<=", endDate);
    }

    return await baseQuery
      .orderBy("total_quantity_ordered", "desc")
      .orderBy("c.name");
  }
}

module.exports = ReportModel;
