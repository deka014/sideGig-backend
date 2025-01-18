const errorHandler = (err, req, res, next) => {
    console.error(err); // Log the error for debugging purposes
  
    // Determine the status code
    const statusCode = err.statusCode || 500;

    const message = err.isOperational
    ? err.message // Operational errors (e.g., validation, business logic)
    : 'An internal server error occurred.'; // Generic message for unknown errors
  
    // Send a JSON response
    res.status(statusCode).json({
      success: false,
      message: message,
    });
  };
  
  module.exports = errorHandler;
  