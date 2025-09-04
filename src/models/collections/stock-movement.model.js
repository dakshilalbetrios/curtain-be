const BaseModel = require("../base/base.model");

class StockMovementModel extends BaseModel {
  constructor() {
    const fieldMappings = [
      {
        field: "collection_sr_no_id",
        alias: "collection_sr_no",
        targetTable: "collections_serial_numbers",
        targetField: "id",
        selectFields: ["sr_no", "current_stock", "unit"],
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
      "collection_sr_no_id",
      "action",
      "quantity",
      "message",
    ];

    super("collection_sr_no_stock_movements", fieldMappings, tableColumns);
  }

  async findByCollectionSrNoId(collectionSrNoId, trx = null) {
    const query = this.getQuery(trx);
    return query
      .where({ collection_sr_no_id: collectionSrNoId })
      .orderBy("created_at", "desc");
  }

  transformResult(stockMovement) {
    if (!stockMovement) return null;
    return stockMovement;
  }
}

module.exports = StockMovementModel;
