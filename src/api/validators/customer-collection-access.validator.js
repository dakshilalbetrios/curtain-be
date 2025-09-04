const Joi = require("joi");

const customerCollectionAccessValidator = {
  // Grant access to collections
  grantAccessSchema: Joi.object({
    collectionIds: Joi.array()
      .items(Joi.number().integer().positive())
      .min(1)
      .max(100)
      .required(),
    status: Joi.string()
      .valid("ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "EXPIRED")
      .default("ACTIVE"),
  }),

  // Update access status
  updateAccessStatusSchema: Joi.object({
    status: Joi.string()
      .valid("ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "EXPIRED")
      .required(),
  }),

  // Bulk update access
  bulkUpdateAccessSchema: Joi.object({
    updates: Joi.array()
      .items(
        Joi.object({
          collectionId: Joi.number().integer().positive().required(),
          status: Joi.string()
            .valid("ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "EXPIRED")
            .required(),
        })
      )
      .min(1)
      .max(100)
      .required(),
  }),

  // User ID parameter
  userIdParamSchema: Joi.object({
    userId: Joi.number().integer().positive().required(),
  }),

  // Collection ID parameter
  collectionIdParamSchema: Joi.object({
    userId: Joi.number().integer().positive().required(),
    collectionId: Joi.number().integer().positive().required(),
  }),

  // Query parameters for getting collections
  getCollectionsQuerySchema: Joi.object({
    status: Joi.string().valid(
      "ACTIVE",
      "INACTIVE",
      "PENDING",
      "SUSPENDED",
      "EXPIRED"
    ),
  }),
};

module.exports = customerCollectionAccessValidator;
