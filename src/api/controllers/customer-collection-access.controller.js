const CustomerCollectionAccessService = require("../../services/collections/customer-collection-access.service");
const knex = require("../../loaders/knex");

class CustomerCollectionAccessController {
  constructor() {}

  async grantAccess(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const customerCollectionAccessService =
        new CustomerCollectionAccessService(req.context);
      const { userId } = req.params;
      const { collectionIds, status } = req.body;

      // Validate that collectionIds is an array
      if (!Array.isArray(collectionIds)) {
        return res.json({
          error: true,
          message: "400::Request body must include collectionIds array",
        });
      }

      // Validate array length (max 100 collections at once)
      if (collectionIds.length > 100) {
        return res.json({
          error: true,
          message: "400::Maximum 100 collections can be granted at once",
        });
      }

      if (collectionIds.length === 0) {
        return res.json({
          error: true,
          message: "400::At least one collection ID must be provided",
        });
      }

      const result = await customerCollectionAccessService.grantAccess({
        customerId: userId,
        collectionIds,
        status,
        trx,
      });

      await trx.commit();

      return res.json({
        data: result,
        message: `201::Successfully granted access to ${result.grantedAccess.length} collections${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ""}`,
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async getCustomerCollections(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const customerCollectionAccessService =
        new CustomerCollectionAccessService(req.context);
      const { userId } = req.params;
      const { status } = req.query;

      const collections =
        await customerCollectionAccessService.getCustomerCollections({
          customerId: userId,
          status,
          trx,
        });

      await trx.commit();

      return res.json({
        data: collections,
        message: "200::Customer collections retrieved successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async bulkUpdateAccess(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const customerCollectionAccessService =
        new CustomerCollectionAccessService(req.context);
      const { userId } = req.params;
      const { updates } = req.body;

      // Validate that updates is an array
      if (!Array.isArray(updates)) {
        return res.json({
          error: true,
          message: "400::Request body must include updates array",
        });
      }

      // Validate array length (max 100 updates at once)
      if (updates.length > 100) {
        return res.json({
          error: true,
          message: "400::Maximum 100 updates can be processed at once",
        });
      }

      if (updates.length === 0) {
        return res.json({
          error: true,
          message: "400::At least one update must be provided",
        });
      }

      // Validate each update has required fields
      for (const update of updates) {
        if (!update.collectionId || !update.status) {
          return res.json({
            error: true,
            message: "400::Each update must include collectionId and status",
          });
        }
      }

      const result = await customerCollectionAccessService.bulkUpdateAccess({
        customerId: userId,
        updates,
        trx,
      });

      await trx.commit();

      return res.json({
        data: result,
        message: `200::Successfully updated access for ${result.updatedAccess.length} collections${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ""}`,
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }
}

module.exports = CustomerCollectionAccessController;
