const StockMovementModel = require("../../models/collections/stock-movement.model");
const knex = require("../../loaders/knex");

class StockMovementService {
  constructor(context) {
    try {
      this.context = context;
      this.stockMovementModel = new StockMovementModel();
    } catch (error) {
      throw error;
    }
  }

  async createStockMovement({
    collectionSrNoId,
    action,
    quantity,
    message,
    trx: providedTrx,
  }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const createdMovement =
        await this.stockMovementModel.createWithoutUsername({
          data: {
            collection_sr_no_id: collectionSrNoId,
            action,
            quantity,
            message: message || `Stock ${action.toLowerCase()} by ${quantity}`,
            created_by: this.context?.user?.id || null,
          },
          trx,
        });

      if (isNewTrx) await trx.commit();
      return createdMovement;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async getMovementsByCollectionSrNo({ collectionSrNoId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const movements = await this.stockMovementModel.findByCollectionSrNoId(
        collectionSrNoId,
        trx
      );

      if (isNewTrx) await trx.commit();
      return movements;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async getMovementById({ movementId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const movement = await this.stockMovementModel.findById({
        id: movementId,
        trx,
      });

      if (!movement) {
        throw new Error("Stock movement not found");
      }

      if (isNewTrx) await trx.commit();
      return movement;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async deleteStockMovement({ collectionMovementId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const movements = await this.stockMovementModel.findAll({
        params: { collection_sr_no_id_eq: collectionMovementId },
        trx,
      });

      for (const movement of movements.data) {
        await this.stockMovementModel.delete({
          id: movement.id,
          trx,
        });
      }

      if (isNewTrx) await trx.commit();
      return;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }
}

module.exports = StockMovementService;
