const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error for debugging purposes
  
    // Determine the status code
    const statusCode = err.statusCode || 500;
  
    // Send a JSON response
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  };
  
  module.exports = errorHandler;
  