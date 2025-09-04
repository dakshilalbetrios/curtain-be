const collectionSrNoRoutes = [
  // Serial Number routes
  {
    method: "POST",
    path: "/collections/:collectionId/serial_numbers",
    handler: "CollectionSrNoController.createSerialNumber",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/collections/:collectionId/serial_numbers",
    handler: "CollectionSrNoController.getSerialNumbersByCollection",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/collections/serial_numbers/:id",
    handler: "CollectionSrNoController.getSerialNumberById",
    authenticate: true,
  },
  {
    method: "PUT",
    path: "/collections/serial_numbers/:id",
    handler: "CollectionSrNoController.updateSerialNumber",
    authenticate: true,
  },
  {
    method: "DELETE",
    path: "/collections/serial_numbers/:id",
    handler: "CollectionSrNoController.deleteSerialNumber",
    authenticate: true,
  },
];

module.exports = collectionSrNoRoutes;
