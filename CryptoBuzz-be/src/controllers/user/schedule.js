import { RecurrenceSchedule } from "../../models/recurrenceSchedule.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
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

  console.log(query, "query");
  const schedules = await RecurrenceSchedule.find(query)
    .sort({ datetime: 1, createdAt: -1 })
    .populate("category", "_id name")
    .populate("educator", "_id first_name last_name image email role status")
    .lean();

  console.log(schedules, "schedules");
  return res.status(200).json(ApiResponse(200, schedules, "Schedules fetched successfully"));
});

export default { getSchedules };
