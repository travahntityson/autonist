// middleware/errorHandler.js
const ApiError = require('../utils/ApiError');

// Note: This function signature (err, req, res, next) is how Express
// identifies it as an error-handling middleware. It MUST have all 4.
const errorHandler = (err, req, res, next) => {
  console.error('ERROR STACK:', err.stack);

  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle our custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  
  // Handle Zod validation errors (we'll add Zod in the next step)
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Invalid input data.';
    // You could also send err.errors for detailed field issues
  }

  // Handle Multer file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413; // Payload Too Large
    message = 'File too large. Maximum size is 3GB.';
  }

  // Handle other common errors
  if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    statusCode = 400; // Bad Request
    message = 'Malformed JSON in request body.';
  }

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

module.exports = errorHandler;