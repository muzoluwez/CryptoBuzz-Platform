export const ApiResponse = (statusCode = 200, data = null, message = "Success") => {
  return {
    statusCode,
    data,
    message,
    success: statusCode < 400,
  };
};