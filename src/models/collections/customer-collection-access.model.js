const BaseModel = require("../base/base.model");

class CustomerCollectionAccessModel extends BaseModel {
  constructor() {
    const fieldMappings = [
      {
        field: "customer_user_id",
        alias: "customer",
        targetTable: "users",
        targetField: "id",
        selectFields: ["name", "mobile_no", "role"],
      },
      {
        field: "collection_id",
        alias: "collection",
        targetTable: "collections",
        targetField: "id",
        selectFields: ["name", "description"],
      },
      {
        field: "created_by",
        alias: "creator",
        targetTable: "users",
        targetField: "id",
        selectFields: ["name", "mobile_no", "role"],
      },
      {
        field: "updated_by",
        alias: "updater",
        targetTable: "users",
        targetField: "id",
        selectFields: ["name", "mobile_no", "role"],
      },
    ];

    const tableColumns = ["id", "customer_user_id", "collection_id", "status"];

    super("customer_collection_access", fieldMappings, tableColumns);
  }

  async findByCollectionId(collectionId, trx = null) {
    const query = this.getQuery(trx);
    return query.where({ collection_id: collectionId });
  }

  async findByCustomerAndCollection(customerId, collectionId, trx = null) {
    const query = this.getQuery(trx);
    return query
      .where({ customer_user_id: customerId, collection_id: collectionId })
      .first();
  }

  transformResult(access) {
    if (!access) return null;
    return access;
  }
}

module.exports = CustomerCollectionAccessModel;
