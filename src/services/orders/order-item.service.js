const { OrderItemModel } = require("../../models");

class OrderItemService {
  constructor(context) {
    try {
      this.context = context;
      this.orderItemModel = new OrderItemModel(context.schema);
    } catch (error) {
      throw error;
    }
  }

  _deserializeItem(item, action) {
    const {
      id,
      order_id,
      collection_sr_no_id,
      quantity,
      created_by,
      updated_by,
    } = item;

    return {
      ...(action === "update" && { id }),
      order_id,
      collection_sr_no_id,
      quantity,
      created_by,
      updated_by,
    };
  }

  async createOrderItem({ orderItemData, orderId, trx }) {
    try {
      const serializedItem = this._deserializeItem(orderItemData, "create");

      const result = await this.orderItemModel.create({
        data: {
          ...serializedItem,
          order_id: orderId,
          created_by: this.context.user.id,
        },
        trx,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async createOrderItemsBulk({ orderItemsData, orderId, trx }) {
    try {
      const orderItemsWithAudit = orderItemsData.map((item) => {
        const serializedItem = this._deserializeItem(item, "create");
        return {
          ...serializedItem,
          order_id: orderId,
          created_by: this.context.user.id,
        };
      });

      console.log("orderItemsWithAudit", orderItemsWithAudit);

      const createdItems = await this.orderItemModel.createBulk({
        data: orderItemsWithAudit,
        trx,
      });
      return createdItems;
    } catch (error) {
      throw error;
    }
  }

  async updateOrderItemsBulk({ orderItemsData, orderId, trx }) {
    try {
      const orderItemsWithAudit = orderItemsData.map((item) => {
        const serializedItem = this._deserializeItem(item, "update");
        return {
          ...serializedItem,
          order_id: orderId,
          updated_by: this.context.user.id,
        };
      });

      const updatedItems = await this.orderItemModel.updateBulk({
        data: orderItemsWithAudit,
        trx,
      });

      return updatedItems;
    } catch (error) {
      throw error;
    }
  }

  async getOrderItemById({ itemId, trx }) {
    try {
      return await this.orderItemModel.findById({
        id: itemId,
        trx,
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllOrderItemsByOrderId({ orderId, params = {}, trx }) {
    try {
      return await this.orderItemModel.findAll({
        params: {
          ...params,
          where: {
            ...params.where,
            order_id: orderId,
          },
          orderBy: [{ column: "id", direction: "asc" }],
        },
        trx,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteOrderItemsByIdBulk({ orderItemIds, trx }) {
    try {
      return await this.orderItemModel.deleteBulk({
        where: { id: orderItemIds },
        trx,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteOrderItemsByOrderIdBulk({ orderId, trx }) {
    try {
      return await this.orderItemModel.deleteBulk({
        where: { order_id: orderId },
        trx,
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrderItemService;
