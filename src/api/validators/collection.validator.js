const Joi = require("joi");

const serialNumberSchema = Joi.object({
  sr_no: Joi.string().max(100).required().messages({
    "string.empty": "Serial number is required",
    "string.max": "Serial number cannot exceed 100 characters",
  }),
  min_stock: Joi.number().precision(2).min(0).default(0).messages({
    "number.base": "Min stock must be a number",
    "number.min": "Min stock cannot be negative",
  }),
  max_stock: Joi.number().precision(2).min(0).default(0).messages({
    "number.base": "Max stock must be a number",
    "number.min": "Max stock cannot be negative",
  }),
  current_stock: Joi.number().precision(2).min(0).default(0).messages({
    "number.base": "Current stock must be a number",
    "number.min": "Current stock cannot be negative",
  }),
  unit: Joi.string().valid("mtr", "pcs").default("mtr").messages({
    "any.only": "Unit must be 'mtr' or 'pcs'",
  }),
});

const createCollectionSchema = Joi.object({
  name: Joi.string().max(150).required().messages({
    "string.empty": "Collection name is required",
    "string.max": "Collection name cannot exceed 150 characters",
  }),
  description: Joi.string().max(255).optional().allow("").messages({
    "string.max": "Description cannot exceed 255 characters",
  }),
  serial_numbers: Joi.array().items(serialNumberSchema).optional().messages({
    "array.base": "Serial numbers must be an array",
  }),
});

const updateCollectionSchema = Joi.object({
  name: Joi.string().max(150).optional().messages({
    "string.max": "Collection name cannot exceed 150 characters",
  }),
  description: Joi.string().max(255).optional().allow("").messages({
    "string.max": "Description cannot exceed 255 characters",
  }),
});

const bulkCreateCollectionSchema = Joi.array()
  .items(createCollectionSchema)
  .min(1)
  .max(100)
  .messages({
    "array.min": "At least one collection must be provided",
    "array.max": "Maximum 100 collections can be created at once",
  });

const collectionIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "Collection ID must be a number",
    "number.integer": "Collection ID must be an integer",
    "number.positive": "Collection ID must be positive",
  }),
});

const collectionIdParamSchema = Joi.object({
  collectionId: Joi.number().integer().positive().required().messages({
    "number.base": "Collection ID must be a number",
    "number.integer": "Collection ID must be an integer",
    "number.positive": "Collection ID must be positive",
  }),
});

const updateSerialNumberSchema = Joi.object({
  sr_no: Joi.string().max(100).optional().messages({
    "string.max": "Serial number cannot exceed 100 characters",
  }),
  min_stock: Joi.number().precision(2).min(0).optional().messages({
    "number.base": "Min stock must be a number",
    "number.min": "Min stock cannot be negative",
  }),
  max_stock: Joi.number().precision(2).min(0).optional().messages({
    "number.base": "Max stock must be a number",
    "number.min": "Max stock cannot be negative",
  }),
  current_stock: Joi.number().precision(2).min(0).optional().messages({
    "number.base": "Current stock must be a number",
    "number.min": "Current stock cannot be negative",
  }),
  unit: Joi.string().valid("mtr", "pcs").optional().messages({
    "any.only": "Unit must be 'mtr' or 'pcs'",
  }),
});

const serialNumberIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "Serial number ID must be a number",
    "number.integer": "Serial number ID must be an integer",
    "number.positive": "Serial number ID must be positive",
  }),
});

module.exports = {
  createCollectionSchema,
  updateCollectionSchema,
  bulkCreateCollectionSchema,
  collectionIdSchema,
  collectionIdParamSchema,
  serialNumberSchema,
  updateSerialNumberSchema,
  serialNumberIdSchema,
};
