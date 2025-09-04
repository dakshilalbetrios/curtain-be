const customerCollectionAccessRoutes = [
  // Grant access to collections
  {
    method: "POST",
    path: "/users/:userId/collections",
    handler: "CustomerCollectionAccessController.grantAccess",
    authenticate: true,
  },
  // List collections accessible by user
  {
    method: "GET",
    path: "/users/:userId/collections",
    handler: "CustomerCollectionAccessController.getCustomerCollections",
    authenticate: true,
  },
  // Bulk update access for multiple collections
  {
    method: "PUT",
    path: "/users/:userId/collections/bulk",
    handler: "CustomerCollectionAccessController.bulkUpdateAccess",
    authenticate: true,
  },
];

module.exports = customerCollectionAccessRoutes;
