const CollectionModel = require("../../models/collections/collection.model");
const CollectionSrNoService = require("./collection-sr-no.service");
const StockMovementService = require("./stock-movement.service");
const knex = require("../../loaders/knex");
const UserService = require("../users/user.service");
const CollectionAccessService = require("./customer-collection-access.service");

class CollectionService {
  constructor(context) {
    try {
      this.context = context;
      this.collectionModel = new CollectionModel();
      this.collectionSrNoService = new CollectionSrNoService(context);
      this.stockMovementService = new StockMovementService(context);
      this.userService = new UserService(context);
      this.collectionAccessService = new CollectionAccessService(context);
    } catch (error) {
      throw error;
    }
  }

  async createCollection({ collectionData, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      // Check if collection name already exists
      const existingCollection = await this.collectionModel.findByName(
        collectionData.name,
        trx
      );

      if (existingCollection) {
        throw new Error("Collection name already exists");
      }

      // Create collection
      const createdCollection =
        await this.collectionModel.createWithoutUsername({
          data: {
            name: collectionData.name,
            description: collectionData.description,
            created_by: this.context?.user?.id || null,
          },
          trx,
        });

      // If serial numbers are provided, create them using the service
      if (
        collectionData.serial_numbers &&
        Array.isArray(collectionData.serial_numbers)
      ) {
        for (const srNoData of collectionData.serial_numbers) {
          await this.collectionSrNoService.createSerialNumber({
            collectionId: createdCollection.id,
            srNoData,
            trx,
          });
        }
      }

      if (isNewTrx) await trx.commit();
      return createdCollection;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async createBulkCollections({ collectionsData, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const createdCollections = [];
      const errors = [];

      for (let i = 0; i < collectionsData.length; i++) {
        try {
          const collectionData = collectionsData[i];

          // Check if collection name already exists
          const existingCollection = await this.collectionModel.findByName(
            collectionData.name,
            trx
          );

          if (existingCollection) {
            errors.push(`Row ${i + 1}: Collection name already exists`);
            continue;
          }

          // Create collection
          const createdCollection =
            await this.collectionModel.createWithoutUsername({
              data: {
                name: collectionData.name,
                description: collectionData.description,
                created_by: this.context?.user?.id || null,
              },
              trx,
            });

          // If serial numbers are provided, create them using the service
          if (
            collectionData.serial_numbers &&
            Array.isArray(collectionData.serial_numbers)
          ) {
            for (const srNoData of collectionData.serial_numbers) {
              await this.collectionSrNoService.createSerialNumber({
                collectionId: createdCollection.id,
                srNoData,
                trx,
              });
            }
          }

          createdCollections.push(createdCollection);
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      if (errors.length > 0 && createdCollections.length === 0) {
        throw new Error(`Bulk creation failed: ${errors.join(", ")}`);
      }

      if (isNewTrx) await trx.commit();
      return {
        createdCollections,
        errors,
        message: `Successfully created ${createdCollections.length} collections${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
      };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async getAllCollections({ params = {}, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const user = await this.userService.getOneUserById({
        userId: this.context?.user?.id,
        trx,
      });

      console.log("user", user);

      const CustomerCollectionAccess =
        await this.collectionAccessService.getCustomerCollections({
          customerId: user.id,
          trx,
        });

      console.log("CustomerCollectionAccess", CustomerCollectionAccess);

      const resultData = await this.collectionModel.findAll({
        params,
        trx,
      });

      console.log("resultData", resultData);

      for (const collection of resultData.data) {
        const serialNumbers =
          await this.collectionSrNoService.getSerialNumbersByCollection({
            collectionId: collection.id,
            trx,
          });
        collection.serial_numbers = serialNumbers;
      }

      if (isNewTrx) await trx.commit();
      return resultData.data;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async getCollectionByIds({ collectionIds, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const collections = await this.collectionModel.findByIds({
        ids: collectionIds,
        trx,
      });

      if (isNewTrx) await trx.commit();
      return collections;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async getCollectionById({ collectionId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      console.log("collectionId", collectionId);

      const collection = await this.collectionModel.findById({
        id: collectionId,
        trx,
      });

      if (!collection) {
        throw new Error("Collection not found");
      }

      // Get serial numbers for this collection using the service
      const serialNumbers =
        await this.collectionSrNoService.getSerialNumbersByCollection({
          collectionId,
          trx,
        });

      const result = {
        ...collection,
        serial_numbers: serialNumbers,
      };

      if (isNewTrx) await trx.commit();
      return result;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async updateCollection({ collectionId, updateData, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      // Check if collection exists
      const existingCollection = await this.collectionModel.findById({
        id: collectionId,
        trx,
      });

      if (!existingCollection) {
        throw new Error("Collection not found");
      }

      // Update collection
      const updatedCollection =
        await this.collectionModel.updateWithoutUsername({
          id: collectionId,
          data: {
            ...updateData,
            updated_by: this.context?.user?.id || null,
          },
          trx,
        });

      if (isNewTrx) await trx.commit();
      return updatedCollection;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async deleteCollection({ collectionId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      // Check if collection exists
      const existingCollection = await this.collectionModel.findById({
        id: collectionId,
        trx,
      });

      if (!existingCollection) {
        throw new Error("Collection not found");
      }

      await this.collectionSrNoService.deleteSerialNumbersByCollection({
        collectionId,
        trx,
      });

      // Soft delete collection (set status to INACTIVE)
      const result = await this.collectionModel.delete({
        id: collectionId,
        trx,
      });

      if (isNewTrx) await trx.commit();
      return result;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }
}

module.exports = CollectionService;
