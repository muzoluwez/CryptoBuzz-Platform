import { ApiResponse } from "../../utils/ApiResponse.js";

export const healthcheck = (req, res) => {
  const payload = {
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  return res
    .status(200)
    .json(ApiResponse(200, payload, "Healthcheck passed"));
};

export default { healthcheck };
