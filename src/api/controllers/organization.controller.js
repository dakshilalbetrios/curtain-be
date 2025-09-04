const { OrganizationService } = require("../../services");
const errorMessages = require("../constants/error-messages.constant");
const successMessages = require("../constants/success-messages.constant");
const knex = require("../../loaders/knex");
const { USER_TYPES } = require("../constants/common");

class OrganizationController {
  constructor() {}

  async createOrganization(req, res, next) {
    let trx = null;
    let isNewTrx = false;
    try {
      // Check if user is MASTER_ADMIN
      if (req.context.user.type !== USER_TYPES.MASTER_ADMIN) {
        return res
          .status(403)
          .json({ error: errorMessages.ORGANIZATION_RESTRICTION });
      }

      trx = await knex.transaction();
      isNewTrx = true;

      const organizationService = new OrganizationService(req.context);
      const organizationData = req.body;

      const createdOrganization = await organizationService.createOrganization({
        organizationData,
        user: req.context.user,
        trx,
      });

      if (isNewTrx) await trx.commit();
      res.status(201).json({ data: createdOrganization });
    } catch (error) {
      if (isNewTrx && trx) await trx.rollback();
      next(error);
    }
  }

  async getAllOrganizations(req, res, next) {
    try {
      const organizationService = new OrganizationService(req.context);

      const { data, pagination } =
        await organizationService.getAllOrganizations({
          params: req.query, // Pass all query params directly to base model (including page/limit)
        });

      return res.status(200).json({
        data,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportOrganizations(req, res, next) {
    try {
      const organizationService = new OrganizationService(req.context);

      const csvData = await organizationService.exportOrganizations({
        params: req.query, // Pass all query params for filtering and sorting
      });

      // Set headers for CSV download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="organizations-export.csv"'
      );

      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }

  async getOneOrganization(req, res, next) {
    try {
      const organizationService = new OrganizationService(req.context);
      const { id } = req.params;

      const organization = await organizationService.getOneOrganization({
        organizationId: id,
      });

      if (!organization) {
        return res
          .status(404)
          .json({ error: errorMessages.ORGANIZATION_NOT_FOUND });
      }

      res.json({ data: organization });
    } catch (error) {
      next(error);
    }
  }

  async updateOrganization(req, res, next) {
    try {
      // Check if user is MASTER_ADMIN
      if (req.context.user.type !== USER_TYPES.MASTER_ADMIN) {
        return res
          .status(403)
          .json({ error: errorMessages.ORGANIZATION_RESTRICTION });
      }

      const organizationService = new OrganizationService(req.context);
      const { id } = req.params;
      const organizationData = req.body;

      const updatedOrganization = await organizationService.updateOrganization({
        organizationId: id,
        organizationData,
      });

      if (!updatedOrganization) {
        return res
          .status(404)
          .json({ error: errorMessages.ORGANIZATION_NOT_FOUND });
      }

      res.json({ data: updatedOrganization });
    } catch (error) {
      next(error);
    }
  }

  async deleteOrganization(req, res, next) {
    try {
      // Check if user is MASTER_ADMIN
      if (req.context.user.type !== USER_TYPES.MASTER_ADMIN) {
        return res
          .status(403)
          .json({ error: errorMessages.ORGANIZATION_RESTRICTION });
      }

      const organizationService = new OrganizationService(req.context);
      const { id } = req.params;

      const result = await organizationService.deleteOrganization({
        organizationId: id,
      });

      if (result === 0) {
        return res
          .status(404)
          .json({ error: errorMessages.ORGANIZATION_NOT_FOUND });
      }

      res.json({
        data: { message: successMessages.ORGANIZATION_DELETED_SUCCESS },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrganizationController;
