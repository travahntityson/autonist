// middleware/validate.js
const { z } = require('zod');

/**
 * Zod validation middleware.
 * @param {z.ZodSchema} schema - The Zod schema to validate against.
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Parse and validate the request body
    // You could also validate req.params or req.query here if needed
    schema.parse(req.body);
    next();
  } catch (error) {
    // If validation fails, pass the ZodError to the central error handler
    // We already configured errorHandler.js to handle this
    next(error);
  }
};

module.exports = validate;