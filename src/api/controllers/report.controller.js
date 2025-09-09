const ReportService = require("../../services/reports/report.service");
const knex = require("../../loaders/knex");

class ReportController {
  constructor() {}

  /**
   * Get customer collection order analytics
   */
  async getCustomerCollectionOrderAnalytics(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const reportService = new ReportService(req.context);

      const { start_date, end_date } = req.query;

      const startDate = start_date ? new Date(start_date) : null;
      const endDate = end_date ? new Date(end_date) : null;

      const result = await reportService.getCustomerCollectionOrderAnalytics({
        startDate,
        endDate,
        trx,
      });

      await trx.commit();
      return res.json({
        data: result.data,
        summary: result.summary,
        message:
          "200::Customer collection order analytics retrieved successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  /**
   * Get most ordered serial numbers
   */
  async getMostOrderedSerialNumbers(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const reportService = new ReportService(req.context);

      const { start_date, end_date, limit } = req.query;

      const startDate = start_date ? new Date(start_date) : null;
      const endDate = end_date ? new Date(end_date) : null;
      const limitNum = limit ? parseInt(limit) : 50;

      const result = await reportService.getMostOrderedSerialNumbers({
        startDate,
        endDate,
        limit: limitNum,
        trx,
      });

      await trx.commit();
      return res.json({
        data: result.data,
        summary: result.summary,
        message: "200::Most ordered serial numbers retrieved successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  /**
   * Get customer order summary
   */
  async getCustomerOrderSummary(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const reportService = new ReportService(req.context);

      const { start_date, end_date } = req.query;

      const startDate = start_date ? new Date(start_date) : null;
      const endDate = end_date ? new Date(end_date) : null;

      const result = await reportService.getCustomerOrderSummary({
        startDate,
        endDate,
        trx,
      });

      await trx.commit();
      return res.json({
        data: result.data,
        summary: result.summary,
        message: "200::Customer order summary retrieved successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  /**
   * Get collection performance analytics
   */
  async getCollectionPerformanceAnalytics(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const reportService = new ReportService(req.context);

      const { start_date, end_date } = req.query;

      const startDate = start_date ? new Date(start_date) : null;
      const endDate = end_date ? new Date(end_date) : null;

      const result = await reportService.getCollectionPerformanceAnalytics({
        startDate,
        endDate,
        trx,
      });

      await trx.commit();
      return res.json({
        data: result.data,
        summary: result.summary,
        message: "200::Collection performance analytics retrieved successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  /**
   * Download customer collection order analytics as CSV
   */
  async downloadCustomerCollectionOrderCSV(req, res, next) {
    try {
      const reportService = new ReportService(req.context);

      const { start_date, end_date } = req.query;

      const startDate = start_date ? new Date(start_date) : null;
      const endDate = end_date ? new Date(end_date) : null;

      const csvBuffer = await reportService.generateCustomerCollectionOrderCSV({
        startDate,
        endDate,
      });

      const filename = `customer-collection-order-analytics-${new Date().toISOString().split("T")[0]}.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", csvBuffer.length);

      return res.send(csvBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download most ordered serial numbers as CSV
   */
  async downloadMostOrderedSerialNumbersCSV(req, res, next) {
    try {
      const reportService = new ReportService(req.context);

      const { start_date, end_date, limit } = req.query;

      const startDate = start_date ? new Date(start_date) : null;
      const endDate = end_date ? new Date(end_date) : null;
      const limitNum = limit ? parseInt(limit) : 50;

      const csvBuffer = await reportService.generateMostOrderedSerialNumbersCSV(
        {
          startDate,
          endDate,
          limit: limitNum,
        }
      );

      const filename = `most-ordered-serial-numbers-${new Date().toISOString().split("T")[0]}.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", csvBuffer.length);

      return res.send(csvBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download customer order summary as CSV
   */
  async downloadCustomerOrderSummaryCSV(req, res, next) {
    try {
      const reportService = new ReportService(req.context);

      const { start_date, end_date } = req.query;

      const startDate = start_date ? new Date(start_date) : null;
      const endDate = end_date ? new Date(end_date) : null;

      const csvBuffer = await reportService.generateCustomerOrderSummaryCSV({
        startDate,
        endDate,
      });

      const filename = `customer-order-summary-${new Date().toISOString().split("T")[0]}.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", csvBuffer.length);

      return res.send(csvBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download collection performance analytics as CSV
   */
  async downloadCollectionPerformanceCSV(req, res, next) {
    try {
      const reportService = new ReportService(req.context);

      const { start_date, end_date } = req.query;

      const startDate = start_date ? new Date(start_date) : null;
      const endDate = end_date ? new Date(end_date) : null;

      const csvBuffer = await reportService.generateCollectionPerformanceCSV({
        startDate,
        endDate,
      });

      const filename = `collection-performance-analytics-${new Date().toISOString().split("T")[0]}.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", csvBuffer.length);

      return res.send(csvBuffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;
