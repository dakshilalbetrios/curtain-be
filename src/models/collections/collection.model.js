const BaseModel = require("../base/base.model");

class CollectionModel extends BaseModel {
  constructor() {
    const fieldMappings = [
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

    const tableColumns = ["id", "name", "description"];

    super("collections", fieldMappings, tableColumns);
  }

  async findByName(name, trx = null) {
    const query = this.getQuery(trx);
    return query.where({ name }).first();
  }

  async findByIds({ ids, trx = null }) {
    const query = this.getQuery(trx);
    return query.whereIn("id", ids);
  }

  transformResult(collection) {
    if (!collection) return null;
    return collection;
  }
}

module.exports = CollectionModel;
