const collectionRoutes = [
  // Collection routes
  {
    method: "POST",
    path: "/collections",
    handler: "CollectionController.createCollection",
    authenticate: true,
  },
  {
    method: "POST",
    path: "/collections/bulk",
    handler: "CollectionController.createBulkCollections",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/collections",
    handler: "CollectionController.getAllCollections",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/collections/:id",
    handler: "CollectionController.getCollectionById",
    authenticate: true,
  },
  {
    method: "PUT",
    path: "/collections/:id",
    handler: "CollectionController.updateCollection",
    authenticate: true,
  },
  {
    method: "DELETE",
    path: "/collections/:id",
    handler: "CollectionController.deleteCollection",
    authenticate: true,
  },
];

module.exports = collectionRoutes;
