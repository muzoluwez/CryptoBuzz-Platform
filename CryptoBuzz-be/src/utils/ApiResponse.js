export const ApiResponse = (statusCode = 200, data = null, message = "Fail") => {
  return {
    statusCode,
    data,
    message,
    success: statusCode < 400,
  };
};
export const GetApiResponse = (statusCode = 200, data = null,pagination, message = "Fail") => {
  return {
    statusCode,
    data,
    pagination,
    message,
    success: statusCode < 400,
  };
};