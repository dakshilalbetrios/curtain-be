const CollectionService = require("../../services/collections/collection.service");
const knex = require("../../loaders/knex");

class CollectionController {
  constructor() {}

  async createCollection(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const collectionService = new CollectionService(req.context);
      const collectionData = req.body;

      const createdCollection = await collectionService.createCollection({
        collectionData,
        trx,
      });

      await trx.commit();
      return res.json({
        data: createdCollection,
        message: "201::Collection created successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async createBulkCollections(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const collectionService = new CollectionService(req.context);
      const collectionsData = req.body;

      // Validate that collectionsData is an array
      if (!Array.isArray(collectionsData)) {
        return res.json({
          error: true,
          message: "400::Request body must be an array of collections",
        });
      }

      // Validate array length (max 100 collections at once)
      if (collectionsData.length > 100) {
        return res.json({
          error: true,
          message: "400::Maximum 100 collections can be created at once",
        });
      }

      if (collectionsData.length === 0) {
        return res.json({
          error: true,
          message: "400::At least one collection must be provided",
        });
      }

      const result = await collectionService.createBulkCollections({
        collectionsData,
        trx,
      });

      console.log("result", result);

      await trx.commit();

      return res.json({
        data: result,
        message: `201::Successfully created ${result.createdCollections.length} collections${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ""}`,
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async getAllCollections(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const collectionService = new CollectionService(req.context);

      const resultData = await collectionService.getAllCollections({
        params: req.query,
        trx,
      });

      await trx.commit();
      return res.json({
        data: resultData,
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async getCollectionById(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const collectionService = new CollectionService(req.context);
      const { id } = req.params;

      const collection = await collectionService.getCollectionById({
        collectionId: id,
        trx,
      });

      await trx.commit();
      return res.json({
        data: collection,
        message: "200::Collection retrieved successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async updateCollection(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();

      const { id } = req.params;
      const collectionData = req.body;

      const collectionService = new CollectionService(req.context);

      const updatedCollection = await collectionService.updateCollection({
        collectionId: id,
        updateData: collectionData,
        trx,
      });

      await trx.commit();
      return res.json({
        data: updatedCollection,
        message: "200::Collection updated successfully",
      });
    } catch (error) {
      console.error("Error in updateCollection controller:", error);
      if (trx) await trx.rollback();
      next(error);
    }
  }

  async deleteCollection(req, res, next) {
    let trx;
    try {
      trx = await knex.transaction();
      const collectionService = new CollectionService(req.context);
      const { id } = req.params;

      await collectionService.deleteCollection({
        collectionId: id,
        trx,
      });

      await trx.commit();
      return res.json({
        data: { message: "Collection deleted successfully" },
        message: "200::Collection deleted successfully",
      });
    } catch (error) {
      if (trx) await trx.rollback();
      next(error);
    }
  }
}

module.exports = CollectionController;
