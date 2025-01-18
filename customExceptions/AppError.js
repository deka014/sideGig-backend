class AppError extends Error {
    constructor(message, status, isOperational = true) {
      super(message);
      this.statusCode = status;
      this.isOperational = isOperational;
    
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = AppError;
  