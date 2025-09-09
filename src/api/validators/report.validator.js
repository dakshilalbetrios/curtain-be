const Joi = require("joi");

const dateSchema = Joi.date().iso().messages({
  "date.base": "Date must be a valid date",
  "date.format": "Date must be in ISO format (YYYY-MM-DD)",
});

const reportQuerySchema = Joi.object({
  start_date: dateSchema.optional().messages({
    "date.base": "Start date must be a valid date",
    "date.format": "Start date must be in ISO format (YYYY-MM-DD)",
  }),
  end_date: dateSchema.optional().messages({
    "date.base": "End date must be a valid date",
    "date.format": "End date must be in ISO format (YYYY-MM-DD)",
  }),
})
  .custom((value, helpers) => {
    // Validate that end_date is after start_date if both are provided
    if (value.start_date && value.end_date) {
      const startDate = new Date(value.start_date);
      const endDate = new Date(value.end_date);

      if (endDate <= startDate) {
        return helpers.error("custom.dateRange");
      }
    }

    return value;
  })
  .messages({
    "custom.dateRange": "End date must be after start date",
  });

const mostOrderedSerialNumbersQuerySchema = Joi.object({
  start_date: dateSchema.optional().messages({
    "date.base": "Start date must be a valid date",
    "date.format": "Start date must be in ISO format (YYYY-MM-DD)",
  }),
  end_date: dateSchema.optional().messages({
    "date.base": "End date must be a valid date",
    "date.format": "End date must be in ISO format (YYYY-MM-DD)",
  }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .default(50)
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 1000",
    }),
})
  .custom((value, helpers) => {
    // Validate that end_date is after start_date if both are provided
    if (value.start_date && value.end_date) {
      const startDate = new Date(value.start_date);
      const endDate = new Date(value.end_date);

      if (endDate <= startDate) {
        return helpers.error("custom.dateRange");
      }
    }

    return value;
  })
  .messages({
    "custom.dateRange": "End date must be after start date",
  });

module.exports = {
  reportQuerySchema,
  mostOrderedSerialNumbersQuerySchema,
};
