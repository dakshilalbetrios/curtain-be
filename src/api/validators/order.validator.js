const Joi = require("joi");

const orderItemSchema = Joi.object({
  collection_sr_no_id: Joi.number().integer().positive().required().messages({
    "number.base": "Collection serial number ID must be a number",
    "number.integer": "Collection serial number ID must be an integer",
    "number.positive": "Collection serial number ID must be positive",
    "any.required": "Collection serial number ID is required",
  }),
  quantity: Joi.number().precision(2).positive().required().messages({
    "number.base": "Quantity must be a number",
    "number.precision": "Quantity can have up to 2 decimal places",
    "number.positive": "Quantity must be positive",
    "any.required": "Quantity is required",
  }),
});

const updateOrderItemSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .when("_action", {
      is: "update",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "number.base": "Order item ID must be a number",
      "number.integer": "Order item ID must be an integer",
      "number.positive": "Order item ID must be positive",
      "any.required": "Order item ID is required for updates",
    }),
  _action: Joi.string()
    .valid("create", "update", "delete")
    .required()
    .messages({
      "any.only": "Action must be one of: create, update, delete",
      "any.required": "Action is required for order item operations",
    }),
  collection_sr_no_id: Joi.when("_action", {
    is: "delete",
    then: Joi.optional(),
    otherwise: Joi.number().integer().positive().required(),
  }).messages({
    "number.base": "Collection serial number ID must be a number",
    "number.integer": "Collection serial number ID must be an integer",
    "number.positive": "Collection serial number ID must be positive",
    "any.required":
      "Collection serial number ID is required for create/update actions",
  }),
  quantity: Joi.when("_action", {
    is: "delete",
    then: Joi.optional(),
    otherwise: Joi.number().precision(2).positive().required(),
  }).messages({
    "number.base": "Quantity must be a number",
    "number.precision": "Quantity can have up to 2 decimal places",
    "number.positive": "Quantity must be positive",
    "any.required": "Quantity is required for create/update actions",
  }),
});

const createOrderSchema = Joi.object({
  order_items: Joi.array().items(orderItemSchema).min(1).required().messages({
    "array.base": "Order items must be an array",
    "array.min": "At least one order item is required",
    "any.required": "Order items are required",
  }),
});

const updateOrderSchema = Joi.object({
  order_items: Joi.array()
    .items(updateOrderItemSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Order items must be an array",
      "array.min": "At least one order item operation is required",
      "any.required": "Order items are required",
    }),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "APPROVED", "SHIPPED", "DELIVERED", "CANCELLED")
    .required()
    .messages({
      "string.empty": "Status is required",
      "any.only":
        "Status must be one of: PENDING, APPROVED, SHIPPED, DELIVERED, CANCELLED",
      "any.required": "Status is required",
    }),
});

const orderIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "Order ID must be a number",
    "number.integer": "Order ID must be an integer",
    "number.positive": "Order ID must be positive",
    "any.required": "Order ID is required",
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
};
