const BaseModel = require("../base/base.model");

class UserModel extends BaseModel {
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

    const tableColumns = [
      "id",
      "name",
      "mobile_no",
      "shop_name",
      "hashed_password",
      "status",
      "role",
      "created_at",
      "created_by",
      "updated_at",
      "updated_by",
    ];

    super("users", fieldMappings, tableColumns);
  }

  async findByMobile(mobileNo, trx = null) {
    // For login, we don't want field mappings that override the actual user data
    const query = this.getQuery(trx);
    return query.where({ mobile_no: mobileNo }).first();
  }

  async findByRole(role, trx = null) {
    const query = this.getQuery(trx);
    return query.where({ role, status: "ACTIVE" });
  }

  async findActiveUsers(trx = null) {
    const query = this.getQuery(trx);
    return query.where({ status: "ACTIVE" });
  }

  async softDelete(id, trx = null) {
    const query = this.getQuery(trx);
    return query.where({ id }).update({ status: "INACTIVE" });
  }

  transformResult(user) {
    if (!user) return null;

    // Remove sensitive data
    const { hashed_password, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = UserModel;
