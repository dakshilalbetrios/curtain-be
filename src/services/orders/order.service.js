const { OrderModel } = require("../../models");
const OrderItemService = require("./order-item.service");
const CollectionSrNoService = require("../collections/collection-sr-no.service");
const StockMovementService = require("../collections/stock-movement.service");
const knex = require("../../loaders/knex");
const config = require("../../configs");

class OrderService {
  constructor(context) {
    try {
      this.context = context;
      this.orderModel = new OrderModel(context.schema);
      this.orderItemService = new OrderItemService(context);
      this.collectionSrNoService = new CollectionSrNoService(context);
      this.stockMovementService = new StockMovementService(context);
    } catch (error) {
      throw error;
    }
  }

  async createOrder({ orderData, trx: providedTrx }) {
    let trx = providedTrx;
    const isNewTrx = !providedTrx;
    try {
      if (isNewTrx) {
        trx = await knex.transaction();
      }

      const { order_items: inputItems, ...orderDataWithoutItems } = orderData;

      const orderWithAudit = {
        ...orderDataWithoutItems,
        status: "PENDING",
        created_by: this.context.user.id,
      };

      const createdOrder = await this.orderModel.create({
        data: orderWithAudit,
        trx,
      });

      const orderItemsToCreate = [];

      if (inputItems?.length) {
        for (const item of inputItems) {
          // Validate stock availability
          const collectionSrNo =
            await this.collectionSrNoService.getSerialNumberById({
              srNoId: item.collection_sr_no_id,
              trx,
            });

          if (!collectionSrNo) {
            throw new Error(
              `Collection serial number ${item.collection_sr_no_id} not found`
            );
          }

          if (collectionSrNo.current_stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${collectionSrNo.sr_no}. Available: ${collectionSrNo.current_stock}, Requested: ${item.quantity}`
            );
          }

          orderItemsToCreate.push({
            ...item,
            order_id: createdOrder.id,
            created_by: this.context.user.id,
          });
        }

        // Create order items
        await this.orderItemService.createOrderItemsBulk({
          orderItemsData: orderItemsToCreate,
          orderId: createdOrder.id,
          trx,
        });

        // Update stock and create stock movements
        await this._handleOrderStockUpdate({
          orderId: createdOrder.id,
          items: orderItemsToCreate,
          trx,
        });
      }

      // Get all items for the order to ensure we have the complete data
      const allOrderItems =
        await this.orderItemService.getAllOrderItemsByOrderId({
          orderId: createdOrder.id,
          trx,
        });

      const result = {
        ...createdOrder,
        order_items: allOrderItems,
      };

      if (isNewTrx) {
        await trx.commit();
      }
      return result;
    } catch (error) {
      if (isNewTrx && trx) {
        await trx.rollback();
      }
      throw error;
    }
  }

  async updateOrder({ orderId, orderData, trx: providedTrx }) {
    let trx = providedTrx;
    const isNewTrx = !providedTrx;
    try {
      if (isNewTrx) {
        trx = await knex.transaction();
      }

      const { order_items: inputItems, ...orderDataWithoutItems } = orderData;

      const orderWithAudit = {
        ...orderDataWithoutItems,
        updated_by: this.context.user.id,
      };

      const updatedOrder = await this.orderModel.update({
        id: orderId,
        data: orderWithAudit,
        trx,
      });

      if (!updatedOrder) {
        await trx.rollback();
        throw new Error("Order not found");
      }

      if (inputItems?.length) {
        const orderItemsToCreate = [];
        const orderItemsToUpdate = [];
        const orderItemIdsToDelete = [];

        for (const item of inputItems) {
          let collectionSrNoId = item.collection_sr_no_id;

          // If collection_sr_no_id is 0, create new collection serial number
          if (typeof collectionSrNoId === "object" && collectionSrNoId.value) {
            // This would need to be implemented based on your business logic
            // For now, we'll throw an error
            throw new Error(
              "Creating new collection serial numbers during order update is not supported"
            );
          }

          if (item._action === "create") {
            // New item to create
            // Validate stock availability
            const collectionSrNo =
              await this.collectionSrNoService.getSerialNumberById({
                srNoId: item.collection_sr_no_id,
                trx,
              });

            if (!collectionSrNo) {
              throw new Error(
                `Collection serial number ${item.collection_sr_no_id} not found`
              );
            }

            if (collectionSrNo.current_stock < item.quantity) {
              throw new Error(
                `Insufficient stock for ${collectionSrNo.sr_no}. Available: ${collectionSrNo.current_stock}, Requested: ${item.quantity}`
              );
            }

            orderItemsToCreate.push({
              ...item,
              order_id: orderId,
              created_by: this.context.user.id,
            });
          } else if (item._action === "delete") {
            // Item to delete
            orderItemIdsToDelete.push(item.id);
          } else if (item._action === "update") {
            // Item to update
            // Get current item to calculate stock difference
            const currentItem = await this.orderItemService.getOrderItemById({
              itemId: item.id,
              trx,
            });

            if (!currentItem) {
              throw new Error(`Order item ${item.id} not found`);
            }

            // Calculate stock difference
            const quantityDifference = item.quantity - currentItem.quantity;

            if (quantityDifference > 0) {
              // Need more stock - validate availability
              const collectionSrNo =
                await this.collectionSrNoService.getSerialNumberById({
                  srNoId: item.collection_sr_no_id,
                  trx,
                });

              if (collectionSrNo.current_stock < quantityDifference) {
                throw new Error(
                  `Insufficient stock for ${collectionSrNo.sr_no}. Available: ${collectionSrNo.current_stock}, Additional needed: ${quantityDifference}`
                );
              }
            }

            orderItemsToUpdate.push({
              ...item,
              id: item.id,
              order_id: orderId,
              updated_by: this.context.user.id,
            });
          }
        }

        // Create new items
        if (orderItemsToCreate.length) {
          await this.orderItemService.createOrderItemsBulk({
            orderItemsData: orderItemsToCreate,
            orderId,
            trx,
          });

          // Update stock for new items
          await this._handleOrderStockUpdate({
            orderId,
            items: orderItemsToCreate,
            trx,
          });
        }

        // Update existing items
        if (orderItemsToUpdate.length) {
          // Handle stock adjustments for updated items
          await this._handleOrderStockAdjustment({
            orderId,
            items: orderItemsToUpdate,
            trx,
          });

          await this.orderItemService.updateOrderItemsBulk({
            orderItemsData: orderItemsToUpdate,
            orderId,
            trx,
          });
        }

        // Delete items and restore stock
        if (orderItemIdsToDelete.length) {
          await this._handleOrderItemsDeletion({
            orderId,
            itemIds: orderItemIdsToDelete,
            trx,
          });

          await this.orderItemService.deleteOrderItemsByIdBulk({
            orderItemIds: orderItemIdsToDelete,
            trx,
          });
        }
      }

      // Get all items for the order to ensure we have the complete data
      const allOrderItems =
        await this.orderItemService.getAllOrderItemsByOrderId({
          orderId,
          trx,
        });

      const result = {
        ...updatedOrder,
        order_items: allOrderItems,
      };

      if (isNewTrx) {
        await trx.commit();
      }
      return result;
    } catch (error) {
      if (isNewTrx && trx) {
        await trx.rollback();
      }
      throw error;
    }
  }

  async updateOrderStatus({
    orderId,
    status,
    courier_tracking_no,
    courier_company,
    trx: providedTrx,
  }) {
    let trx = providedTrx;
    const isNewTrx = !providedTrx;
    try {
      if (isNewTrx) {
        trx = await knex.transaction();
      }

      const orderWithAudit = {
        status,
        courier_tracking_no,
        courier_company,
        updated_by: this.context.user.id,
      };

      const updatedOrder = await this.orderModel.update({
        id: orderId,
        data: orderWithAudit,
        trx,
      });

      if (!updatedOrder) {
        await trx.rollback();
        throw new Error("Order not found");
      }

      // If order is cancelled, restore stock
      if (status === "CANCELLED") {
        await this._handleOrderCancellation({
          orderId,
          trx,
        });
      }

      if (isNewTrx) {
        await trx.commit();
      }
      return updatedOrder;
    } catch (error) {
      if (isNewTrx && trx) {
        await trx.rollback();
      }
      throw error;
    }
  }

  async deleteOrder({ orderId, trx: providedTrx }) {
    let trx = providedTrx;
    const isNewTrx = !providedTrx;
    try {
      if (isNewTrx) {
        trx = await knex.transaction();
      }

      const order = await this.getOneOrder({
        orderId,
        trx,
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Restore stock for all items
      if (order.order_items.length > 0) {
        await this._handleOrderCancellation({
          orderId,
          trx,
        });
      }

      // Delete all order items first
      await this.orderItemService.deleteOrderItemsByOrderIdBulk({
        orderId,
        trx,
      });

      // Then delete the order
      const result = await this.orderModel.delete({
        id: orderId,
        trx,
      });

      if (isNewTrx) {
        await trx.commit();
      }
      return result;
    } catch (error) {
      if (isNewTrx && trx) {
        await trx.rollback();
      }
      throw error;
    }
  }

  async getOneOrder({ orderId, trx: providedTrx }) {
    let trx = providedTrx;
    try {
      const order = await this.orderModel.findById({
        id: orderId,
        trx,
      });

      if (!order) {
        return null;
      }

      const orderItems = await this.orderItemService.getAllOrderItemsByOrderId({
        orderId: order.id,
        trx,
      });

      return {
        ...order,
        order_items: orderItems,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllOrders({ params = {}, trx: providedTrx }) {
    let trx = providedTrx;
    try {
      // If user is customer, only show their orders
      if (this.context.user.role === "CUSTOMER") {
        params.created_by_eq = this.context.user.id;
      }

      if (params.status_in === "OVER_DUE") {
        params.status_in = ["PENDING", "APPROVED", "SHIPPED"];
        // Calculate the date that is ORDER_DELIVERED_DAY days ago
        const overdueDate = new Date();
        overdueDate.setDate(overdueDate.getDate() - config.ORDER_DELIVERED_DAY);

        params.created_at_lt = overdueDate;
      }

      const orders = await this.orderModel.findAll({
        params,
        trx,
      });

      // Get all items for each order
      const ordersWithItems = await Promise.all(
        orders.data.map(async (order) => {
          const items = await this.orderItemService.getAllOrderItemsByOrderId({
            orderId: order.id,
            trx,
          });
          return {
            ...order,
            order_items: items,
          };
        })
      );

      return {
        data: ordersWithItems,
        pagination: orders.pagination,
      };
    } catch (error) {
      throw error;
    }
  }

  async _handleOrderStockUpdate({ orderId, items, trx }) {
    for (const item of items) {
      // Update collection serial number stock
      await this.collectionSrNoService.updateSerialNumber({
        srNoId: item.collection_sr_no_id,
        updateData: {
          current_stock: knex.raw(`current_stock - ${item.quantity}`),
        },
        trx,
      });

      // Create stock movement entry
      await this.stockMovementService.createStockMovement({
        collectionSrNoId: item.collection_sr_no_id,
        action: "OUT",
        quantity: item.quantity,
        message: `Order #${orderId} - ${item.quantity} units sold`,
        trx,
      });
    }
  }

  async _handleOrderStockAdjustment({ orderId, items, trx }) {
    for (const item of items) {
      // Get current item to calculate stock difference
      const currentItem = await this.orderItemService.getOrderItemById({
        itemId: item.id,
        trx,
      });

      if (!currentItem) continue;

      const quantityDifference = +item.quantity - +currentItem.quantity;

      if (quantityDifference !== 0) {
        // Update collection serial number stock
        await this.collectionSrNoService.updateSerialNumber({
          srNoId: item.collection_sr_no_id,
          updateData: {
            current_stock: knex.raw(`current_stock - ${quantityDifference}`),
          },
          trx,
        });

        // Create stock movement entry
        const action = quantityDifference > 0 ? "OUT" : "IN";
        const message =
          quantityDifference > 0
            ? `Order #${orderId} updated - ${Math.abs(quantityDifference)} additional units sold`
            : `Order #${orderId} updated - ${Math.abs(quantityDifference)} units restored`;

        await this.stockMovementService.createStockMovement({
          collectionSrNoId: item.collection_sr_no_id,
          action,
          quantity: Math.abs(quantityDifference),
          message,
          trx,
        });
      }
    }
  }

  async _handleOrderItemsDeletion({ orderId, itemIds, trx }) {
    for (const itemId of itemIds) {
      const item = await this.orderItemService.getOrderItemById({
        itemId,
        trx,
      });

      if (!item) continue;

      // Restore collection serial number stock
      await this.collectionSrNoService.updateSerialNumber({
        srNoId: item.collection_sr_no_id,
        updateData: {
          current_stock: knex.raw(`current_stock + ${item.quantity}`),
        },
        trx,
      });

      // Create stock movement entry for restoration
      await this.stockMovementService.createStockMovement({
        collectionSrNoId: item.collection_sr_no_id,
        action: "IN",
        quantity: item.quantity,
        message: `Order #${orderId} item deleted - ${item.quantity} units restored`,
        trx,
      });
    }
  }

  async _handleOrderCancellation({ orderId, trx }) {
    const orderItems = await this.orderItemService.getAllOrderItemsByOrderId({
      orderId,
      trx,
    });

    for (const item of orderItems) {
      // Restore collection serial number stock
      await this.collectionSrNoService.updateSerialNumber({
        srNoId: item.collection_sr_no_id,
        updateData: {
          current_stock: knex.raw(`current_stock + ${item.quantity}`),
        },
        trx,
      });

      // Create stock movement entry for restoration
      await this.stockMovementService.createStockMovement({
        collectionSrNoId: item.collection_sr_no_id,
        action: "IN",
        quantity: item.quantity,
        message: `Order #${orderId} cancelled - ${item.quantity} units restored`,
        trx,
      });
    }
  }
}

module.exports = OrderService;
