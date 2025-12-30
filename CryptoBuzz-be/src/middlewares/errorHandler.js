import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Check if error has statusCode property (ApiError instances have this)
  if (!error.statusCode) {
    // If it's a regular Error, convert it to ApiError format
    const statusCode = 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message);
  }

  // Send error response with proper format
  const response = {
    statusCode: error.statusCode || 500,
    message: error.message || "Internal Server Error",
    success: false,
    data: null,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode || 500).json(response);
};

export default errorHandler;

