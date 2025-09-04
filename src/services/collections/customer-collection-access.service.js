const CustomerCollectionAccessModel = require("../../models/collections/customer-collection-access.model");
const UserModel = require("../../models/users/user.model");
const knex = require("../../loaders/knex");

class CustomerCollectionAccessService {
  constructor(context) {
    try {
      this.context = context;
      this.customerCollectionAccessModel = new CustomerCollectionAccessModel();
      this.userModel = new UserModel();
      this._collectionService = null; // Lazy loading
    } catch (error) {
      throw error;
    }
  }

  get collectionService() {
    if (!this._collectionService) {
      const CollectionService = require("./collection.service");
      this._collectionService = new CollectionService(this.context);
    }
    return this._collectionService;
  }

  async grantAccess({
    customerId,
    collectionIds,
    status = "ACTIVE",
    trx: providedTrx,
  }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      // Validate customer exists
      const customer = await this.userModel.findById({ id: customerId, trx });
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Validate all collections exist at once
      const collections = await this.collectionService.getCollectionByIds({
        collectionIds: collectionIds,
        trx,
      });

      if (collections.length !== collectionIds.length) {
        throw new Error("One or more collections not found");
      }

      const grantedAccess = [];
      const errors = [];

      for (const collectionId of collectionIds) {
        try {
          // Check if access already exists
          const existingAccess =
            await this.customerCollectionAccessModel.findByCustomerAndCollection(
              customerId,
              collectionId,
              trx
            );

          if (existingAccess) {
            if (existingAccess.status === "ACTIVE") {
              errors.push(
                `Access already granted for collection ID ${collectionId}`
              );
              continue;
            } else {
              // Update existing inactive access to active
              const updatedAccess =
                await this.customerCollectionAccessModel.updateWithoutUsername({
                  id: existingAccess.id,
                  data: {
                    status: "ACTIVE",
                    updated_by: this.context?.user?.id || null,
                  },
                  trx,
                });
              grantedAccess.push(updatedAccess);
            }
          } else {
            // Create new access
            const newAccess =
              await this.customerCollectionAccessModel.createWithoutUsername({
                data: {
                  customer_user_id: customerId,
                  collection_id: collectionId,
                  status,
                  created_by: this.context?.user?.id || null,
                },
                trx,
              });
            grantedAccess.push(newAccess);
          }
        } catch (error) {
          errors.push(
            `Failed to grant access for collection ID ${collectionId}: ${error.message}`
          );
        }
      }

      if (isNewTrx) await trx.commit();
      return {
        grantedAccess,
        errors,
        message: `Successfully granted access to ${grantedAccess.length} collections${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
      };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async getCustomerCollections({ customerId, status, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      // Validate customer exists
      const customer = await this.userModel.findById({ id: customerId, trx });
      if (!customer) {
        throw new Error("Customer not found");
      }

      let query = { customer_user_id: customerId };
      if (status) {
        query.status = status;
      }

      const accessList = await this.customerCollectionAccessModel.findAll({
        params: query,
        trx,
      });

      if (isNewTrx) await trx.commit();
      return accessList;
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async bulkUpdateAccess({ customerId, updates, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      // Validate customer exists
      const customer = await this.userModel.findById({ id: customerId, trx });
      if (!customer) {
        throw new Error("Customer not found");
      }

      const updatedAccess = [];
      const errors = [];

      for (const update of updates) {
        try {
          const { collectionId, status } = update;

          // Validate status
          const validStatuses = [
            "ACTIVE",
            "INACTIVE",
            "PENDING",
            "SUSPENDED",
            "EXPIRED",
          ];
          if (!validStatuses.includes(status)) {
            errors.push(
              `Invalid status '${status}' for collection ID ${collectionId}`
            );
            continue;
          }

          // Validate collection exists
          const collection = await this.collectionService.getCollectionById({
            collectionId: collectionId,
            trx,
          });
          if (!collection) {
            errors.push(`Collection ID ${collectionId} not found`);
            continue;
          }

          // Find existing access
          const existingAccess =
            await this.customerCollectionAccessModel.findByCustomerAndCollection(
              customerId,
              collectionId,
              trx
            );

          if (existingAccess) {
            // Update existing access
            const result =
              await this.customerCollectionAccessModel.updateWithoutUsername({
                id: existingAccess.id,
                data: {
                  status,
                  updated_by: this.context?.user?.id || null,
                },
                trx,
              });
            updatedAccess.push(result);
          } else {
            // Create new access
            const result =
              await this.customerCollectionAccessModel.createWithoutUsername({
                data: {
                  customer_user_id: customerId,
                  collection_id: collectionId,
                  status,
                  created_by: this.context?.user?.id || null,
                },
                trx,
              });
            updatedAccess.push(result);
          }
        } catch (error) {
          errors.push(
            `Failed to update access for collection ID ${update.collectionId}: ${error.message}`
          );
        }
      }

      if (isNewTrx) await trx.commit();
      return {
        updatedAccess,
        errors,
        message: `Successfully updated access for ${updatedAccess.length} collections${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
      };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }

  async deleteCustomerCollectionAccess({ collectionId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const existingAccess = await this.customerCollectionAccessModel.findAll({
        params: { collection_id_eq: collectionId },
        trx,
      });

      if (existingAccess.length === 0) {
        throw new Error("Customer collection access not found");
      }

      console.log("existingAccess", existingAccess);

      for (const access of existingAccess.data) {
        await this.customerCollectionAccessModel.delete({
          id: access.id,
          trx,
        });
      }

      if (isNewTrx) await trx.commit();
      return { message: "Customer collection access deleted successfully" };
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      throw error;
    }
  }
}

module.exports = CustomerCollectionAccessService;
