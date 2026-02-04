import { RecurrenceSchedule } from "../../models/recurrenceSchedule.js";
import Schedule from "../../models/schedule.js";
import LiveStream from "../../models/liveStream.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { streamClient } from "../../utils/constants.js";
import { User } from "../../models/user.js";
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
    .populate({
      path: "schedule",
      select: "educator",
      populate: {
        path: "educator",
        select: "_id first_name last_name image email role status"
      }
    })
    .lean();

  // Map schedules to include educator from parent Schedule document
  const mappedSchedules = schedules.map((schedule) => ({
    ...schedule,
    educator: schedule.schedule?.educator || null
  }));

  return res.status(200).json(ApiResponse(200, mappedSchedules, "Schedules fetched successfully"));
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
    // Stream's generateUserToken uses the API secret automatically (no need to pass JWT_SECRET)
    // validity_in_seconds: 31536000 = 1 year (365 * 24 * 60 * 60)
    const token = streamClient.generateUserToken({
      user_id: userId,
      validity_in_seconds: 31536000, // 1 year
    });
    return res.status(200).json(ApiResponse(200, { token }, "Token generated successfully"));
  } catch (error) {
    console.error("Error generating Stream token:", error);
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

  // Check for active live stream where isLive is true
  const activeLiveStream = await LiveStream.findOne({
    educator: new mongoose.Types.ObjectId(educatorId),
    isLive: true,
    status: { $in: ["active", "pending"] } // Can be active or pending but isLive must be true
  })
    .populate("educator", "_id first_name last_name image email bannerImage description")
    .populate({
      path: "schedule",
      select: "_id title description image tags tier accessType",
      populate: {
        path: "plans",
        select: "name price description hotmartCheckoutCode hotmartCheckoutUrl"
      }
    })
    .populate("plans", "name price description hotmartCheckoutCode hotmartCheckoutUrl")
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

  return res
    .status(200)
    .json(ApiResponse(200, { ...activeLiveStream, isLive: true }, "Active live stream fetched successfully"));
});

export const getAllActiveLiveStreams = asyncHandler(async (req, res) => {
  try {
    // Find all active live streams where isLive is true and status is active
    const activeLiveStreams = await LiveStream.find({
      isLive: true,
      status: "active",
      isDeleted: false,
    })
      .populate("educator", "_id first_name last_name image email bannerImage description")
      .populate({
        path: "schedule",
        select: "_id title description image tags tier accessType",
        populate: {
          path: "plans",
          select: "name price description hotmartCheckoutCode hotmartCheckoutUrl"
        }
      })
      .populate("plans", "name price description hotmartCheckoutCode hotmartCheckoutUrl")
      .sort({ createdAt: -1 })
      .lean();

    if (!activeLiveStreams || activeLiveStreams.length === 0) {
      return res.status(200).json(ApiResponse(200, [], "No active live streams found"));
    }

    return res.status(200).json(ApiResponse(200, activeLiveStreams, "Active live streams fetched successfully"));
  } catch (error) {
    console.error("Error fetching active live streams:", error);
    throw new ApiError(500, "Error fetching active live streams");
  }
});

export default { getSchedules, getToken, getActiveLiveStreamByEducator, getAllActiveLiveStreams };
