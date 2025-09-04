const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().max(100).required().messages({
    "string.empty": "Name is required",
    "string.max": "Name cannot exceed 100 characters",
  }),
  mobile_no: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.empty": "Mobile number is required",
      "string.pattern.base": "Mobile number must be 10-15 digits",
    }),
  shop_name: Joi.string().max(150).optional().allow("").messages({
    "string.max": "Shop name cannot exceed 150 characters",
  }),
  password: Joi.string().min(4).max(100).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 4 characters",
    "string.max": "Password cannot exceed 100 characters",
  }),
  role: Joi.string()
    .valid("ADMIN", "SALES", "CUSTOMER")
    .default("CUSTOMER")
    .messages({
      "any.only": "Role must be ADMIN, SALES, or CUSTOMER",
    }),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE").messages({
    "any.only": "Status must be ACTIVE or INACTIVE",
  }),
});

const updateUserSchema = Joi.object({
  name: Joi.string().max(100).optional().messages({
    "string.max": "Name cannot exceed 100 characters",
  }),
  mobile_no: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      "string.pattern.base": "Mobile number must be 10-15 digits",
    }),
  shop_name: Joi.string().max(150).optional().allow("").messages({
    "string.max": "Shop name cannot exceed 150 characters",
  }),
  password: Joi.string().min(4).max(100).optional().messages({
    "string.min": "Password must be at least 4 characters",
    "string.max": "Password cannot exceed 100 characters",
  }),
  role: Joi.string().valid("ADMIN", "SALES", "CUSTOMER").optional().messages({
    "any.only": "Role must be ADMIN, SALES, or CUSTOMER",
  }),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional().messages({
    "any.only": "Status must be ACTIVE or INACTIVE",
  }),
});

const bulkCreateUserSchema = Joi.array()
  .items(createUserSchema)
  .min(1)
  .max(100)
  .messages({
    "array.min": "At least one user must be provided",
    "array.max": "Maximum 100 users can be created at once",
  });

const userIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "User ID must be a number",
    "number.integer": "User ID must be an integer",
    "number.positive": "User ID must be positive",
  }),
});

const loginSchema = Joi.object({
  mobile_no: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.empty": "Mobile number is required",
      "string.pattern.base": "Mobile number must be 10-15 digits",
    }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  bulkCreateUserSchema,
  userIdSchema,
  loginSchema,
};
