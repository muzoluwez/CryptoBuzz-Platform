import { RecurrenceSchedule } from "../../models/recurrenceSchedule.js";
import LiveStream from "../../models/liveStream.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { streamClient } from "../../utils/constants.js";
import mongoose from "mongoose";

export const getSchedules = asyncHandler(async (req, res) => {
  const { categoryId, language, startDate, endDate } = req.query;

  const query = {};

  if (!categoryId) {
    throw new ApiError(400, "categoryId is required");
  }
  if (mongoose.Types.ObjectId.isValid(categoryId)) {
    query.category = new mongoose.Types.ObjectId(categoryId);
  } else {
    throw new ApiError(400, "Invalid categoryId format");
  }

  if (language) {
    query.language = language;
  }

  if (startDate || endDate) {
    query.datetime = {};

    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new ApiError(400, "Invalid startDate format");
      }
      query.datetime.$gte = start;
    }

    if (endDate) {
      let end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new ApiError(400, "Invalid endDate format");
      }
      end.setHours(23, 59, 59, 999);
      query.datetime.$lte = end;
    }
  }

  const schedules = await RecurrenceSchedule.find(query)
    .sort({ datetime: 1, createdAt: -1 })
    .populate("category", "_id name")
    .populate("educator", "_id first_name last_name image email role status")
    .lean();

  return res.status(200).json(ApiResponse(200, schedules, "Schedules fetched successfully"));
});


export const getToken = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!streamClient) {
    throw new ApiError(500, "Stream client is not initialized");
  }

  try {
    const token = streamClient.generateUserToken(
      { user_id: userId },
      process.env.JWT_SECRET,
      {
        expiresIn: "1y",
      }
    );
    return res.status(200).json(ApiResponse(200, { token }, "Token generated successfully"));
  } catch (error) {
    console.error("Error generating token:", error);
    throw new ApiError(500, "Error generating token");
  }
});

export const getActiveLiveStreamByEducator = asyncHandler(async (req, res) => {
  const { educatorId } = req.params;

  if (!educatorId) {
    throw new ApiError(400, "Educator ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(educatorId)) {
    throw new ApiError(400, "Invalid educator ID format");
  }

  const User = (await import("../../models/user.js")).default;
  
  const activeLiveStream = await LiveStream.findOne({
    educator: new mongoose.Types.ObjectId(educatorId),
    status: "active",
  })
    .populate("educator", "_id first_name last_name image email bannerImage description")
    .populate("schedule", "_id title description image tags")
    .lean();

  if (!activeLiveStream) {
    // Return educator info even when offline
    const educator = await User.findById(educatorId)
      .select("_id first_name last_name image email bannerImage description")
      .lean();

    if (!educator) {
      throw new ApiError(404, "Educator not found");
    }

    return res.status(200).json(ApiResponse(200, { educator, isLive: false }, "Educator info fetched successfully"));
  }

  return res.status(200).json(ApiResponse(200, { ...activeLiveStream, isLive: true }, "Active live stream fetched successfully"));
});

export default { getSchedules, getToken, getActiveLiveStreamByEducator };
