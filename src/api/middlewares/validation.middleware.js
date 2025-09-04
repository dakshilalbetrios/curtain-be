const validator = require("../validators");
const { camelCase } = require("lodash");
const logger = require("../../utils/logger");

/**
 * Get validation schema for a controller method
 * @param {string} controllerName - Name of the controller
 * @param {string} methodName - Name of the method
 * @returns {Object|null} Validation schema or null if not found
 */
const getValidationSchema = (controllerName, methodName) => {
  const controllerKey = camelCase(controllerName.replace("Controller", ""));
  const methodKey = camelCase(methodName);
  return validator[`${controllerKey}Validators`]?.[methodKey] || null;
};

/**
 * Validate data against schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Joi validation schema
 * @param {string} controllerName - Name of the controller
 * @param {string} methodName - Name of the method
 * @returns {Object} Validated data
 * @throws {Error} Validation error
 */
const validateData = (data, schema, controllerName, methodName) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    logger.warn(
      `Validation failed for ${controllerName}.${methodName}: ${errorMessage}`
    );
    throw new Error(errorMessage);
  }

  return value;
};

/**
 * Validation middleware factory
 * @param {string} controllerName - Name of the controller
 * @param {string} methodName - Name of the method
 * @returns {Function} Express middleware
 */
const validationMiddleware = (controllerName, methodName) => {
  return async (req, _res, next) => {
    try {
      const schema = getValidationSchema(controllerName, methodName);

      if (!schema) {
        logger.warn(
          `No validation schema found for ${controllerName}.${methodName}`
        );
        return next();
      }

      // Validate request data
      const validatedData = {
        body: await validateData(req.body, schema, controllerName, methodName),
        query: await validateData(
          req.query,
          schema,
          controllerName,
          methodName
        ),
        params: await validateData(
          req.params,
          schema,
          controllerName,
          methodName
        ),
      };

      // Attach validated data to request
      req.validated = validatedData;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validationMiddleware;
