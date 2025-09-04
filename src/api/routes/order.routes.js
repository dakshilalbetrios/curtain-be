const orderRoutes = [
  {
    method: "POST",
    path: "/orders",
    handler: "OrderController.createOrder",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/orders/:id",
    handler: "OrderController.getOneOrder",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/orders",
    handler: "OrderController.getAllOrders",
    authenticate: true,
  },
  {
    method: "PUT",
    path: "/orders/:id",
    handler: "OrderController.updateOrder",
    authenticate: true,
  },
  {
    method: "PUT",
    path: "/orders/:id/status",
    handler: "OrderController.updateOrderStatus",
    authenticate: true,
  },
  {
    method: "DELETE",
    path: "/orders/:id",
    handler: "OrderController.deleteOrder",
    authenticate: true,
  },
];

module.exports = orderRoutes;
