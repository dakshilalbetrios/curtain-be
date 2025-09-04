const { OrganizationModel } = require("../../models");
const errorMessages = require("../../api/constants/error-messages.constant");
const { UserModel } = require("../../models");
const knex = require("../../loaders/knex");

class OrganizationService {
  constructor(context) {
    try {
      this.context = context;
      this.organizationModel = new OrganizationModel();
      this.userModel = new UserModel();
    } catch (error) {
      throw error;
    }
  }

  async createOrganization({ organizationData, trx }) {
    try {
      const isExistedOrganization = await this.organizationModel.findOne({
        where: { id: organizationData.id },
        trx,
      });

      if (isExistedOrganization)
        throw new Error(errorMessages.ALREADY_EXISTED_ORGANIZATION);

      await this.organizationModel.create({
        data: {
          ...organizationData,
          created_by: this.context.user.id,
        },
        trx,
      });

      const createdOrganization = { ...organizationData };

      return createdOrganization;
    } catch (error) {
      throw error;
    }
  }

  async updateOrganization({ organizationId, organizationData, trx }) {
    try {
      return await this.organizationModel.updateWithoutUsername({
        id: organizationId,
        data: {
          ...organizationData,
          updated_by: this.context.user.id,
        },
        trx,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteOrganization({ organizationId, trx: providedTrx }) {
    let trx = providedTrx;
    let isNewTrx = false;
    try {
      if (!trx) {
        trx = await knex.transaction();
        isNewTrx = true;
      }

      const isExistedOrganization = await this.organizationModel.findOne({
        where: { id: organizationId },
        trx,
      });

      if (!isExistedOrganization)
        throw new Error(errorMessages.ORGANIZATION_NOT_FOUND);

      // Get all users in this organization
      const users = await this.userModel.findAll({
        params: { organization_id: organizationId },
        trx,
      });

      const userIds = users.data.map((user) => user.id);

      // Delete all users in this organization
      for (const userId of userIds) {
        await this.userModel.delete({
          id: userId,
          trx,
        });
      }

      // Delete the organization
      await this.organizationModel.delete({
        id: organizationId,
        trx,
      });

      if (isNewTrx) {
        await trx.commit();
      }

      return { message: "Organization deleted successfully" };
    } catch (error) {
      if (isNewTrx && trx) {
        await trx.rollback();
      }
      throw error;
    }
  }

  async getOneOrganization({ organizationId, trx }) {
    try {
      return await this.organizationModel.findOne({
        where: { id: organizationId },
        trx,
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllOrganizations({ params = {}, trx }) {
    try {
      return await this.organizationModel.findAll({
        params,
        trx,
      });
    } catch (error) {
      throw error;
    }
  }

  async exportOrganizations({ params = {}, trx }) {
    try {
      // Get all organizations data with filters and sorting (no pagination)
      const { data } = await this.organizationModel.findAll({
        params: { ...params, limit: undefined, page: undefined }, // Remove pagination for export
        trx,
      });

      // Call common CSV service
      const CsvService = require("../common/csv.service");
      const csvService = new CsvService();

      return csvService.generateCsv({
        type: "organizations",
        data: data,
        queryParams: params,
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrganizationService;
