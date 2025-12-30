import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const getDashboardData = async (req, res) => {
    try {
        const user = req.user;
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: error.errors || error.message
        });
    }
}

export const getActiveLiveStream = async (req, res) => {
    try {
        const user = req.user;
    } catch (error) {
    throw new ApiError(400, "No active live stream found");
  }

    return res.status(200).json(ApiResponse(200, liveStream, "Active live stream fetched successfully"));
}