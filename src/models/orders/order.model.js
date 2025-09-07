const BaseModel = require("../base/base.model");

class OrderModel extends BaseModel {
  constructor() {
    const fieldMappings = [
      {
        field: "created_by",
        alias: "creator",
        targetTable: "users",
        targetField: "id",
        selectFields: ["id", "name", "mobile_no", "role"],
      },
      {
        field: "updated_by",
        alias: "updater",
        targetTable: "users",
        targetField: "id",
        selectFields: ["id", "name", "mobile_no", "role"],
      },
    ];

    const tableColumns = [
      "id",
      "courier_tracking_no",
      "courier_company",
      "status",
      "created_by",
      "created_at",
      "updated_by",
      "updated_at",
    ];

    const setColumns = [];

    // Define search configuration - maps search field names to actual database columns
    const searchConfig = {
      // Order search fields
      status: {
        field: "orders.status",
      },
      creator_name: {
        field: "creator.name",
      },
      updater_name: {
        field: "updater.name",
      },
    };

    super("orders", fieldMappings, tableColumns, setColumns, searchConfig);
  }

  async findById({ id, trx }) {
    const query = this.getQuery(trx);
    const result = await query
      .select([
        "orders.*",
        "creator.name as creator_name",
        "creator.mobile_no as creator_mobile",
        "creator.role as creator_role",
        "updater.name as updater_name",
        "updater.mobile_no as updater_mobile",
        "updater.role as updater_role",
      ])
      .leftJoin("users as creator", "orders.created_by", "creator.id")
      .leftJoin("users as updater", "orders.updated_by", "updater.id")
      .where("orders.id", id)
      .first();

    return result ? this.transformResult(result) : null;
  }

  transformResult(order) {
    if (!order) return null;

    return {
      id: order.id,
      courier_tracking_no: order.courier_tracking_no,
      courier_company: order.courier_company,
      status: order.status,
      created_by: order.created_by,
      created_at: order.created_at,
      updated_by: order.updated_by,
      updated_at: order.updated_at,
      creator: order.creator_name
        ? {
            id: order.created_by,
            name: order.creator_name,
            mobile_no: order.creator_mobile,
            role: order.creator_role,
          }
        : null,
      updater: order.updated_by
        ? {
            id: order.updated_by,
            name: order.updater_name,
            mobile_no: order.updater_mobile,
            role: order.updater_role,
          }
        : null,
    };
  }
}

module.exports = OrderModel;
