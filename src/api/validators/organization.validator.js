const Joi = require("joi");
const errorMessages = require("../constants/error-messages.constant");
const { ORGANIZATION_STATUSES } = require("../constants/common");

exports.create = Joi.object().keys({
  id: Joi.string()
    .pattern(/^[a-z0-9\-]+$/)
    .required()
    .error(new Error(errorMessages.INVALID_ORGANIZATION_SLUG)),
  name: Joi.string()
    .required()
    .error(new Error(errorMessages.INVALID_ORGANIZATION_NAME)),
  contact_email: Joi.string()
    .email()
    .optional()
    .allow(null)
    .error(new Error(errorMessages.INVALID_EMAIL)),
  contact_mobile_no: Joi.string()
    .pattern(/^\+\d+$/)
    .optional()
    .allow(null)
    .error(new Error(errorMessages.INVALID_CONTACT_MOBILE_NO)),
  status: Joi.string()
    .valid(...Object.values(ORGANIZATION_STATUSES))
    .default("ACTIVE")
    .error(new Error(errorMessages.INVALID_STATUS)),
});

exports.update = Joi.object().keys({
  name: Joi.string()
    .optional()
    .error(new Error(errorMessages.INVALID_ORGANIZATION_NAME)),
  contact_email: Joi.string()
    .email()
    .optional()
    .allow(null)
    .error(new Error(errorMessages.INVALID_EMAIL)),
  contact_mobile_no: Joi.string()
    .pattern(/^\+\d+$/)
    .optional()
    .allow(null)
    .error(new Error(errorMessages.INVALID_CONTACT_MOBILE_NO)),
  status: Joi.string()
    .valid(...Object.values(ORGANIZATION_STATUSES))
    .optional()
    .error(new Error(errorMessages.INVALID_STATUS)),
});

exports.params = Joi.object().keys({
  id: Joi.string()
    .pattern(/^[a-z0-9\-]+$/)
    .required()
    .error(new Error(errorMessages.INVALID_ORGANIZATION_SLUG)),
});
