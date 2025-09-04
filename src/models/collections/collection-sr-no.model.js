const BaseModel = require("../base/base.model");

class CollectionSrNoModel extends BaseModel {
  constructor() {
    const fieldMappings = [
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

    const tableColumns = [
      "id",
      "collection_id",
      "sr_no",
      "min_stock",
      "max_stock",
      "current_stock",
      "unit",
    ];

    super("collections_serial_numbers", fieldMappings, tableColumns);
  }

  async findBySrNo(srNo, trx = null) {
    const query = this.getQuery(trx);
    return query.where({ sr_no: srNo }).first();
  }

  async findByCollectionId(collectionId, trx = null) {
    const query = this.getQuery(trx);
    return query.where({ collection_id: collectionId });
  }

  transformResult(collectionSrNo) {
    if (!collectionSrNo) return null;
    return collectionSrNo;
  }
}

module.exports = CollectionSrNoModel;
