const BaseModel = require("../base/base.model");

class OrganizationModel extends BaseModel {
  constructor() {
    const fieldMappings = [
      {
        field: "created_by",
        alias: "creator",
        targetTable: "users",
        targetField: "id",
        selectFields: ["first_name", "last_name"],
      },
      {
        field: "updated_by",
        alias: "updater",
        targetTable: "users",
        targetField: "id",
        selectFields: ["first_name", "last_name"],
      },
    ];

    const tableColumns = [
      "id",
      "name",
      "contact_email",
      "contact_mobile_no",
      "status",
    ];
    super("organizations", fieldMappings, tableColumns);
  }

  async create({ data, trx = null }) {
    const query = this.getQuery(trx);
    await query.insert(data);
  }

  transformResult(organization) {
    if (!organization) return null;

    return organization;
  }
}

module.exports = OrganizationModel;
