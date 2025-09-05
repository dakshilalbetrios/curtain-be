const CollectionModel = require("../../models/collections/collection.model");
const CollectionSrNoService = require("./collection-sr-no.service");
const StockMovementService = require("./stock-movement.service");
const knex = require("../../loaders/knex");
const UserService = require("../users/user.service");

class CollectionService {
  constructor(context) {
    try {
      this.context = context;
      this.collectionModel = new CollectionModel();
      this.collectionSrNoService = new CollectionSrNoService(context);
      this.stockMovementService = new StockMovementService(context);
      this.userService = new UserService(context);
      this._collectionAccessService = null; // Lazy loading
    } catch (error) {
      throw error;
    }
  }

  get collectionAccessService() {
    if (!this._collectionAccessService) {
      const CollectionAccessService = require("./customer-collection-access.service");
      this._collectionAccessService = new CollectionAccessService(this.context);
    }
    return this._collectionAccessService;
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

      let resultData;

      // Only apply collection access filtering for CUSTOMER role
      if (user.role === "CUSTOMER") {
        const CustomerCollectionAccess =
          await this.collectionAccessService.getCustomerCollections({
            customerId: user.id,
            status: "ACTIVE", // Only get active access
            trx,
          });

        // Extract collection IDs from active access records
        const accessibleCollectionIds = CustomerCollectionAccess.data
          .filter((item) => item.status === "ACTIVE")
          .map((item) => item.collection_id);

        // If user has no access to any collections, return empty array
        if (accessibleCollectionIds.length === 0) {
          if (isNewTrx) await trx.commit();
          return [];
        }

        // Add collection_id filter to params for customers
        const filteredParams = {
          ...params,
          id_in: accessibleCollectionIds, // Use id_in to filter collections by accessible IDs
        };

        resultData = await this.collectionModel.findAll({
          params: filteredParams,
          trx,
        });
      } else {
        // For non-customer roles (ADMIN, etc.), return all collections without filtering
        resultData = await this.collectionModel.findAll({
          params,
          trx,
        });
      }

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
    const isNewTrx = !providedTrx;
    try {
      if (isNewTrx) {
        trx = await knex.transaction();
      }

      const {
        serial_numbers: inputSerialNumbers,
        ...collectionDataWithoutSerialNumbers
      } = updateData;

      const collectionWithAudit = {
        ...collectionDataWithoutSerialNumbers,
        updated_by: this.context?.user?.id || null,
      };

      const updatedCollection =
        await this.collectionModel.updateWithoutUsername({
          id: collectionId,
          data: collectionWithAudit,
          trx,
        });

      if (!updatedCollection) {
        if (isNewTrx) {
          await trx.rollback();
        }
        throw new Error("Collection not found");
      }

      if (inputSerialNumbers?.length) {
        const serialNumbersToCreate = [];
        const serialNumbersToUpdate = [];
        const serialNumberIdsToDelete = [];

        for (const serialNumber of inputSerialNumbers) {
          if (serialNumber._action === "create") {
            // New serial number to create
            serialNumbersToCreate.push({
              ...serialNumber,
              collection_id: collectionId,
              created_by: this.context?.user?.id || null,
            });
          } else if (serialNumber._action === "delete") {
            // Serial number to delete
            serialNumberIdsToDelete.push(serialNumber.id);
          } else if (serialNumber._action === "update") {
            // Serial number to update
            serialNumbersToUpdate.push({
              ...serialNumber,
              id: serialNumber.id,
              collection_id: collectionId,
              updated_by: this.context?.user?.id || null,
            });
          }
        }

        // Create new serial numbers
        if (serialNumbersToCreate.length) {
          await this.collectionSrNoService.createBulkSerialNumbers({
            collectionId,
            srNoData: serialNumbersToCreate,
            trx,
          });
        }

        // Update existing serial numbers
        if (serialNumbersToUpdate.length) {
          await this.collectionSrNoService.updateBulkSerialNumbers({
            srNoData: serialNumbersToUpdate,
            trx,
          });
        }

        // Delete serial numbers
        if (serialNumberIdsToDelete.length) {
          await this.collectionSrNoService.deleteBulkSerialNumbers({
            srNoIds: serialNumberIdsToDelete,
            trx,
          });
        }
      }

      // Get all serial numbers for the collection to ensure we have the complete data
      const allSerialNumbers =
        await this.collectionSrNoService.getSerialNumbersByCollection({
          collectionId,
          trx,
        });

      const result = {
        ...updatedCollection,
        serial_numbers: allSerialNumbers,
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

      await this.collectionAccessService.deleteCustomerCollectionAccess({
        collectionId,
        trx,
      });

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
