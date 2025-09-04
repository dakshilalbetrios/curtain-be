const BaseModel = require("../base/base.model");

class OrderItemModel extends BaseModel {
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
      "order_id",
      "collection_sr_no_id",
      "quantity",
      "created_by",
      "created_at",
      "updated_by",
      "updated_at",
    ];

    super("order_items", fieldMappings, tableColumns);
  }

  async findAll({ params = {}, trx = null }) {
    const query = this.getQuery(trx);
    let qb = query;

    // Build base query with joins
    qb = qb
      .leftJoin(
        "collections_serial_numbers",
        "order_items.collection_sr_no_id",
        "collections_serial_numbers.id"
      )
      .leftJoin(
        "collections",
        "collections_serial_numbers.collection_id",
        "collections.id"
      )
      .leftJoin("users as creator", "order_items.created_by", "creator.id")
      .leftJoin("users as updater", "order_items.updated_by", "updater.id");

    // Apply where conditions
    if (params.where) {
      Object.entries(params.where).forEach(([key, value]) => {
        qb = qb.where(`order_items.${key}`, value);
      });
    }

    // Select fields including related details
    qb = qb.select([
      "order_items.*",
      "collections_serial_numbers.sr_no",
      "collections_serial_numbers.current_stock",
      "collections_serial_numbers.unit",
      "collections.name as collection_name",
      "collections.description as collection_description",
      "creator.name as creator_name",
      "creator.mobile_no as creator_mobile",
      "creator.role as creator_role",
      "updater.name as updater_name",
      "updater.mobile_no as updater_mobile",
      "updater.role as updater_role",
    ]);

    // Apply sorting
    if (params.orderBy?.length > 0) {
      params.orderBy.forEach(({ column, direction }) => {
        qb = qb.orderBy(`order_items.${column}`, direction);
      });
    } else {
      qb = qb.orderBy("order_items.created_at", "desc");
    }

    const results = await qb;

    // Transform results
    return Array.isArray(results)
      ? results.map(this.transformOrderItemResult)
      : [this.transformOrderItemResult(results)];
  }

  async createBulk({ data, trx = null }) {
    const query = this.getQuery(trx);
    return query.insert(data);
  }

  async updateBulk({ data, trx = null }) {
    // Validate that each item has an id
    try {
      const baseQuery = this.getQuery(trx);

      const updatePromises = data.map(async (item) => {
        const { id, ...updateData } = item;
        return baseQuery
          .clone()
          .where("id", id)
          .update(updateData)
          .then((result) => ({
            id,
            success: result > 0,
            updated: result,
          }));
      });

      const results = await Promise.all(updatePromises);

      return results;
    } catch (error) {
      throw error;
    }
  }

  async deleteBulk({ where, trx = null }) {
    const query = this.getQuery(trx);

    for (const key in where) {
      const value = where[key];
      if (Array.isArray(value)) {
        query.whereIn(key, value);
      } else {
        query.where(key, value);
      }
    }

    return query.delete();
  }

  transformOrderItemResult(item) {
    if (!item) return null;

    return {
      id: item.id,
      order_id: item.order_id,
      collection_sr_no_id: item.collection_sr_no_id,
      quantity: item.quantity,
      created_by: item.created_by,
      created_at: item.created_at,
      updated_by: item.updated_by,
      updated_at: item.updated_at,
      collection_details: {
        name: item.collection_name,
        description: item.collection_description,
        sr_no: item.sr_no,
        current_stock: item.current_stock,
        unit: item.unit,
      },
      created_by_name: item.created_by
        ? `${item.creator_name || ""} ${item.creator_mobile || ""}`.trim()
        : null,
      updated_by_name: item.updated_by
        ? `${item.updater_name || ""} ${item.updater_mobile || ""}`.trim()
        : null,
    };
  }
}

module.exports = OrderItemModel;
