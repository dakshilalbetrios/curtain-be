const reportRoutes = [
  // Customer Collection Order Analytics Routes
  {
    method: "GET",
    path: "/reports/customer-collection-orders",
    handler: "ReportController.getCustomerCollectionOrderAnalytics",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/reports/customer-collection-orders/download/csv",
    handler: "ReportController.downloadCustomerCollectionOrderCSV",
    authenticate: true,
  },

  // Most Ordered Serial Numbers Routes
  {
    method: "GET",
    path: "/reports/most-ordered-serial-numbers",
    handler: "ReportController.getMostOrderedSerialNumbers",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/reports/most-ordered-serial-numbers/download/csv",
    handler: "ReportController.downloadMostOrderedSerialNumbersCSV",
    authenticate: true,
  },

  // Customer Order Summary Routes
  {
    method: "GET",
    path: "/reports/customer-order-summary",
    handler: "ReportController.getCustomerOrderSummary",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/reports/customer-order-summary/download/csv",
    handler: "ReportController.downloadCustomerOrderSummaryCSV",
    authenticate: true,
  },

  // Collection Performance Analytics Routes
  {
    method: "GET",
    path: "/reports/collection-performance",
    handler: "ReportController.getCollectionPerformanceAnalytics",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/reports/collection-performance/download/csv",
    handler: "ReportController.downloadCollectionPerformanceCSV",
    authenticate: true,
  },
];

module.exports = reportRoutes;
