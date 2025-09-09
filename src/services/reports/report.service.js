const ReportModel = require("../../models/reports/report.model");
const knex = require("../../loaders/knex");
const CSVService = require("../common/csv.service");

class ReportService {
  constructor(context) {
    try {
      this.context = context;
      this.reportModel = new ReportModel();
      this.csvService = new CSVService();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get customer collection order analytics
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @param {Object} options.trx - Transaction object
   * @returns {Object} Customer collection order analytics
   */
  async getCustomerCollectionOrderAnalytics({
    startDate,
    endDate,
    trx: providedTrx,
  }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const data = await this.reportModel.getCustomerCollectionOrderAnalytics({
        trx,
        startDate,
        endDate,
      });

      if (isNewTrx) await trx.commit();
      return {
        data,
        summary: {
          total_customers: new Set(data.map((item) => item.customer_id)).size,
          total_collections: new Set(data.map((item) => item.collection_id))
            .size,
          total_orders: data.reduce(
            (sum, item) => sum + parseInt(item.total_orders),
            0
          ),
          total_quantity: data.reduce(
            (sum, item) => sum + parseFloat(item.total_quantity_ordered || 0),
            0
          ),
        },
      };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  /**
   * Get most ordered serial numbers
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @param {number} options.limit - Limit results
   * @param {Object} options.trx - Transaction object
   * @returns {Object} Most ordered serial numbers data
   */
  async getMostOrderedSerialNumbers({
    startDate,
    endDate,
    limit = 50,
    trx: providedTrx,
  }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const data = await this.reportModel.getMostOrderedSerialNumbers({
        trx,
        startDate,
        endDate,
        limit,
      });

      if (isNewTrx) await trx.commit();
      return {
        data,
        summary: {
          total_serial_numbers: data.length,
          total_orders: data.reduce(
            (sum, item) => sum + parseInt(item.total_orders),
            0
          ),
          total_quantity: data.reduce(
            (sum, item) => sum + parseFloat(item.total_quantity_ordered || 0),
            0
          ),
          unique_customers: new Set(data.map((item) => item.unique_customers))
            .size,
        },
      };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  /**
   * Get customer order summary
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @param {Object} options.trx - Transaction object
   * @returns {Object} Customer order summary
   */
  async getCustomerOrderSummary({ startDate, endDate, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const data = await this.reportModel.getCustomerOrderSummary({
        trx,
        startDate,
        endDate,
      });

      if (isNewTrx) await trx.commit();
      return {
        data,
        summary: {
          total_customers: data.length,
          total_orders: data.reduce(
            (sum, item) => sum + parseInt(item.total_orders),
            0
          ),
          total_quantity: data.reduce(
            (sum, item) => sum + parseFloat(item.total_quantity_ordered || 0),
            0
          ),
          avg_orders_per_customer:
            data.length > 0
              ? (
                  data.reduce(
                    (sum, item) => sum + parseInt(item.total_orders),
                    0
                  ) / data.length
                ).toFixed(2)
              : 0,
        },
      };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  /**
   * Get collection performance analytics
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @param {Object} options.trx - Transaction object
   * @returns {Object} Collection performance analytics
   */
  async getCollectionPerformanceAnalytics({
    startDate,
    endDate,
    trx: providedTrx,
  }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const data = await this.reportModel.getCollectionPerformanceAnalytics({
        trx,
        startDate,
        endDate,
      });

      if (isNewTrx) await trx.commit();
      return {
        data,
        summary: {
          total_collections: data.length,
          total_orders: data.reduce(
            (sum, item) => sum + parseInt(item.total_orders || 0),
            0
          ),
          total_quantity: data.reduce(
            (sum, item) => sum + parseFloat(item.total_quantity_ordered || 0),
            0
          ),
          total_serial_numbers: data.reduce(
            (sum, item) => sum + parseInt(item.total_serial_numbers || 0),
            0
          ),
        },
      };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  /**
   * Generate CSV for customer collection order analytics
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @returns {Buffer} CSV buffer
   */
  async generateCustomerCollectionOrderCSV({ startDate, endDate }) {
    const result = await this.getCustomerCollectionOrderAnalytics({
      startDate,
      endDate,
    });

    const csvData = result.data.map((item) => ({
      "Customer Name": item.customer_name,
      "Customer Mobile": item.customer_mobile,
      "Collection Name": item.collection_name,
      "Total Orders": item.total_orders,
      "Total Quantity Ordered": item.total_quantity_ordered,
      // "Unique Serial Numbers Ordered": item.unique_serial_numbers_ordered,
    }));

    return this.csvService.generateCsv({
      type: "customer-collection-orders",
      data: csvData,
      queryParams: { startDate, endDate },
    });
  }

  /**
   * Generate CSV for most ordered serial numbers
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @param {number} options.limit - Limit results
   * @returns {Buffer} CSV buffer
   */
  async generateMostOrderedSerialNumbersCSV({
    startDate,
    endDate,
    limit = 50,
  }) {
    const result = await this.getMostOrderedSerialNumbers({
      startDate,
      endDate,
      limit,
    });

    const csvData = result.data.map((item) => ({
      "Serial Number": item.serial_number,
      "Collection Name": item.collection_name,
      "Total Orders": item.total_orders,
      "Total Quantity Ordered": item.total_quantity_ordered,
      // "Unique Customers": item.unique_customers,
      // "Average Quantity per Order": parseFloat(
      //   item.avg_quantity_per_order || 0
      // ).toFixed(2),
      // "Max Quantity Ordered": item.max_quantity_ordered,
      // "Min Quantity Ordered": item.min_quantity_ordered,
    }));

    return this.csvService.generateCsv({
      type: "most-ordered-serial-numbers",
      data: csvData,
      queryParams: { startDate, endDate, limit },
    });
  }

  /**
   * Generate CSV for customer order summary
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @returns {Buffer} CSV buffer
   */
  async generateCustomerOrderSummaryCSV({ startDate, endDate }) {
    const result = await this.getCustomerOrderSummary({ startDate, endDate });

    const csvData = result.data.map((item) => ({
      "Customer Name": item.customer_name,
      "Customer Mobile": item.customer_mobile,
      "Total Orders": item.total_orders,
      // "Unique Products Ordered": item.unique_products_ordered,
      "Total Quantity Ordered": item.total_quantity_ordered,
      // "Unique Collections Ordered": item.unique_collections_ordered,
      // "Average Quantity per Item": parseFloat(
      //   item.avg_quantity_per_item || 0
      // ).toFixed(2),
      // "First Order Date": item.first_order_date,
      // "Last Order Date": item.last_order_date,
    }));

    return this.csvService.generateCsv({
      type: "customer-order-summary",
      data: csvData,
      queryParams: { startDate, endDate },
    });
  }

  /**
   * Generate CSV for collection performance analytics
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @returns {Buffer} CSV buffer
   */
  async generateCollectionPerformanceCSV({ startDate, endDate }) {
    const result = await this.getCollectionPerformanceAnalytics({
      startDate,
      endDate,
    });

    const csvData = result.data.map((item) => ({
      "Collection Name": item.collection_name,
      "Total Serial Numbers": item.total_serial_numbers,
      "Total Orders": item.total_orders,
      "Unique Customers": item.unique_customers,
      "Total Quantity Ordered": item.total_quantity_ordered,
      // "Active Serial Numbers": item.active_serial_numbers,
      // "Average Quantity per Order": parseFloat(
      //   item.avg_quantity_per_order || 0
      // ).toFixed(2),
    }));

    return this.csvService.generateCsv({
      type: "collection-performance-analytics",
      data: csvData,
      queryParams: { startDate, endDate },
    });
  }
}

module.exports = ReportService;
