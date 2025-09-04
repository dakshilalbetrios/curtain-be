const CollectionSrNoService = require("../../services/collections/collection-sr-no.service");
const knex = require("../../loaders/knex");
const successMessages = require("../constants/success-messages.constant");

class CollectionSrNoController {
  constructor() {}

  async createSerialNumber(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const collectionSrNoService = new CollectionSrNoService(req.context);
      const { collectionId } = req.params;
      const srNoData = req.body;

      const createdSrNo = await collectionSrNoService.createSerialNumber({
        collectionId,
        srNoData,
        trx,
      });

      await trx.commit();
      return res.json({
        data: createdSrNo,
        message: "201::Serial number created successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async getSerialNumbersByCollection(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const collectionSrNoService = new CollectionSrNoService(req.context);
      const { collectionId } = req.params;

      const serialNumbers =
        await collectionSrNoService.getSerialNumbersByCollection({
          collectionId,
          trx,
        });

      await trx.commit();
      return res.json({
        data: serialNumbers,
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async getSerialNumberById(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const collectionSrNoService = new CollectionSrNoService(req.context);
      const { id } = req.params;

      const serialNumber = await collectionSrNoService.getSerialNumberById({
        srNoId: id,
        trx,
      });

      await trx.commit();
      return res.json({
        data: serialNumber,
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async updateSerialNumber(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const collectionSrNoService = new CollectionSrNoService(req.context);
      const { id } = req.params;
      const srNoData = req.body;

      const updatedSrNo = await collectionSrNoService.updateSerialNumber({
        srNoId: id,
        updateData: srNoData,
        trx,
      });

      await trx.commit();
      return res.json({
        data: updatedSrNo,
        message: "200::Serial number updated successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async deleteSerialNumber(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();

      const { id } = req.params;

      const collectionSrNoService = new CollectionSrNoService(req.context);

      await collectionSrNoService.deleteSerialNumber({
        srNoId: id,
        trx,
      });

      await trx.commit();
      return res.json({
        data: { message: successMessages.SERIAL_NUMBER_DELETED_SUCCESS },
        message: "200::Serial number deleted successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }
}

module.exports = CollectionSrNoController;
