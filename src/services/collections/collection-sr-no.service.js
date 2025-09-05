const CollectionSrNoModel = require("../../models/collections/collection-sr-no.model");
const StockMovementService = require("./stock-movement.service");
const knex = require("../../loaders/knex");

class CollectionSrNoService {
  constructor(context) {
    try {
      this.context = context;
      this.collectionSrNoModel = new CollectionSrNoModel();
      this.stockMovementService = new StockMovementService(context);
    } catch (error) {
      throw error;
    }
  }

  async createSerialNumber({ collectionId, srNoData, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      // Check if SR_NO already exists
      const existingSrNo = await this.collectionSrNoModel.findBySrNo(
        srNoData.sr_no,
        trx
      );

      if (existingSrNo) {
        throw new Error("Serial number already exists");
      }

      // Create serial number
      const createdSrNo = await this.collectionSrNoModel.createWithoutUsername({
        data: {
          collection_id: collectionId,
          sr_no: srNoData.sr_no,
          min_stock: srNoData.min_stock || 0,
          max_stock: srNoData.max_stock || 0,
          current_stock: srNoData.current_stock || 0,
          unit: srNoData.unit || "mtr",
          created_by: this.context?.user?.id || null,
        },
        trx,
      });

      if (isNewTrx) await trx.commit();
      return createdSrNo;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async createBulkSerialNumbers({ collectionId, srNoData, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const createdSrNos = [];
      const errors = [];

      for (const srNo of srNoData) {
        try {
          console.log("srNoData", srNoData);
          const createdSrNo = await this.createSerialNumber({
            collectionId,
            srNoData: srNo,
            trx,
          });
          createdSrNos.push(createdSrNo);
        } catch (error) {
          errors.push(error.message);
          continue;
        }
      }

      console.log("createdSrNos", createdSrNos);
      console.log("errors", errors);

      if (isNewTrx) await trx.commit();
      return {
        createdSrNos,
        errors,
      };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async updateSerialNumber({ srNoId, updateData, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      // Check if SR_NO exists
      const existingSrNo = await this.collectionSrNoModel.findById({
        id: srNoId,
        trx,
      });

      if (!existingSrNo) {
        throw new Error("Serial number not found");
      }

      // Handle stock updates with action and quantity
      if (updateData.action && updateData.quantity !== undefined) {
        const { action, quantity, reason } = updateData;

        // Validate action
        if (!["IN", "OUT"].includes(action)) {
          throw new Error("Action must be 'IN' or 'OUT'");
        }

        // Validate quantity
        if (quantity <= 0) {
          throw new Error("Quantity must be greater than 0");
        }

        // Calculate new stock based on action
        let newStock;
        if (action === "IN") {
          newStock = +existingSrNo.current_stock + +quantity;
        } else {
          // OUT
          if (existingSrNo.current_stock < quantity) {
            throw new Error(
              `Insufficient stock. Available: ${existingSrNo.current_stock}, Requested: ${quantity}`
            );
          }
          newStock = existingSrNo.current_stock - quantity;
        }

        // Create stock movement record
        await this.stockMovementService.createStockMovement({
          collectionSrNoId: srNoId,
          action,
          quantity,
          message:
            reason ||
            `${action === "IN" ? "Stock added" : "Stock reduced"}: ${quantity} ${existingSrNo.unit || "units"} (Previous: ${existingSrNo.current_stock}, New: ${newStock})`,
          trx,
        });

        // Update the current_stock in updateData and remove action/quantity fields
        updateData.current_stock = newStock;
        delete updateData.action;
        delete updateData.quantity;
        delete updateData.reason;
      }

      // Update serial number
      const updatedSrNo = await this.collectionSrNoModel.updateWithoutUsername({
        id: srNoId,
        data: {
          ...updateData,
          updated_by: this.context?.user?.id || null,
        },
        trx,
      });

      if (isNewTrx) await trx.commit();
      return updatedSrNo;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async updateBulkSerialNumbers({ srNoData, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const updatedSrNos = [];
      const errors = [];

      for (const srNo of srNoData) {
        try {
          const { _action, ...finalSrNoData } = srNo;

          console.log("finalSrNoData", finalSrNoData);
          const updatedSrNo = await this.updateSerialNumber({
            srNoId: finalSrNoData.id,
            updateData: finalSrNoData,
            trx,
          });
          updatedSrNos.push(updatedSrNo);
        } catch (error) {
          errors.push(error.message);
          continue;
        }
      }

      if (isNewTrx) await trx.commit();
      return {
        updatedSrNos,
        errors,
      };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async deleteSerialNumber({ srNoId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      // Check if SR_NO exists
      const existingSrNo = await this.collectionSrNoModel.findById({
        id: srNoId,
        trx,
      });

      if (!existingSrNo) {
        throw new Error("Serial number not found");
      }

      await this.stockMovementService.deleteStockMovement({
        collectionMovementId: existingSrNo.id,
        trx,
      });

      // Delete serial number
      const result = await this.collectionSrNoModel.delete({
        id: srNoId,
        trx,
      });

      if (isNewTrx) await trx.commit();
      return result;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async deleteSerialNumbersByCollection({ collectionId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const serialNumbers = await this.collectionSrNoModel.findByCollectionId(
        collectionId,
        trx
      );

      console.log("serialNumbers", serialNumbers);

      for (const serialNumber of serialNumbers) {
        await this.stockMovementService.deleteStockMovement({
          collectionMovementId: serialNumber.id,
          trx,
        });
      }

      for (const serialNumber of serialNumbers) {
        await this.collectionSrNoModel.delete({
          id: serialNumber.id,
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

  async deleteBulkSerialNumbers({ srNoIds, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const deletedSrNos = [];
      const errors = [];
      for (const srNoId of srNoIds) {
        try {
          const deletedSrNo = await this.deleteSerialNumber({ srNoId, trx });
          deletedSrNos.push(deletedSrNo);
        } catch (error) {
          errors.push(error.message);
          continue;
        }
      }

      if (isNewTrx) await trx.commit();
      return {
        deletedSrNos,
        errors,
      };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async getSerialNumbersByCollection({ collectionId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const serialNumbers = await this.collectionSrNoModel.findByCollectionId(
        collectionId,
        trx
      );

      if (isNewTrx) await trx.commit();
      return serialNumbers;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async getSerialNumberById({ srNoId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const serialNumber = await this.collectionSrNoModel.findById({
        id: srNoId,
        trx,
      });

      if (!serialNumber) {
        throw new Error("Serial number not found");
      }

      if (isNewTrx) await trx.commit();
      return serialNumber;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }
}

module.exports = CollectionSrNoService;
