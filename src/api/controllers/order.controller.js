const { OrderService } = require("../../services");
const knex = require("../../loaders/knex");

class OrderController {
  constructor() {}

  async createOrder(req, res, next) {
    const trx = await knex.transaction();
    try {
      const orderService = new OrderService(req.context);
      const orderData = req.body;

      const createdOrder = await orderService.createOrder({
        orderData,
        trx,
      });

      await trx.commit();
      res.status(201).json({ data: createdOrder });
    } catch (error) {
      await trx.rollback();
      next(error);
    }
  }

  async updateOrder(req, res, next) {
    const trx = await knex.transaction();
    try {
      const orderService = new OrderService(req.context);
      const { id } = req.params;
      const orderData = req.body;

      const updatedOrder = await orderService.updateOrder({
        orderId: id,
        orderData,
        trx,
      });

      await trx.commit();
      res.json({ data: updatedOrder });
    } catch (error) {
      await trx.rollback();
      next(error);
    }
  }

  async getAllOrders(req, res, next) {
    try {
      const orderService = new OrderService(req.context);

      const { data, pagination } = await orderService.getAllOrders({
        params: req.query, // Pass all query params directly to base model (including page/limit)
      });

      return res.status(200).json({
        data,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOneOrder(req, res, next) {
    try {
      const orderService = new OrderService(req.context);
      const { id } = req.params;

      const order = await orderService.getOneOrder({
        orderId: id,
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json({ data: order });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    const trx = await knex.transaction();
    try {
      const orderService = new OrderService(req.context);
      const { id } = req.params;

      console.log("id", id);
      console.log("req.body", req.body);
      const { status, courier_tracking_no, courier_company } = req.body;

      // Validate status
      const validStatuses = [
        "PENDING",
        "APPROVED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      // Only ADMIN and SALES can update order status
      if (!["ADMIN", "SALES"].includes(req.context.user.role)) {
        return res.status(403).json({
          error: "Only ADMIN and SALES users can update order status",
        });
      }

      console.log("courier_tracking_no", courier_tracking_no);
      console.log("courier_company", courier_company);

      const updatedOrder = await orderService.updateOrderStatus({
        orderId: id,
        status,
        courier_tracking_no,
        courier_company,
        trx,
      });

      await trx.commit();
      res.json({ data: updatedOrder });
    } catch (error) {
      await trx.rollback();
      next(error);
    }
  }

  async deleteOrder(req, res, next) {
    const trx = await knex.transaction();
    try {
      const orderService = new OrderService(req.context);
      const { id } = req.params;

      // Only ADMIN and SALES can delete orders
      if (!["ADMIN", "SALES"].includes(req.context.user.role)) {
        return res.status(403).json({
          error: "Only ADMIN and SALES users can delete orders",
        });
      }

      await orderService.deleteOrder({
        orderId: id,
        trx,
      });

      await trx.commit();
      res.json({
        data: { message: "Order deleted successfully" },
      });
    } catch (error) {
      await trx.rollback();
      next(error);
    }
  }
}

module.exports = OrderController;
