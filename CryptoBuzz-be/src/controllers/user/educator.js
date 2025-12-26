import UserModel from "../../models/user.js";
import { Course } from "../../models/course.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { GetApiResponse } from "../../utils/ApiResponse.js";

export const getAllEducator = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim() || "";
  const category = req.query.category || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const skip = (page - 1) * limit;

  const query = { role: "educator", status: "true" };

  // --- Search Filter ---
  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { first_name: new RegExp(search, "i") },
      { last_name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];
  }

  // --- Category Filter ---
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.categories = category;
  } else if (category) {
    throw ApiError(400, "Invalid category format");
  }

  // --- Fetch Educators ---
  const educatorDetails = await UserModel.find(query)
    .select(
      "-password -following -postsCount -likesReceived -isDeleted -createdAt -updatedAt -deletedAt"
    )
    .populate("categories", "name _id")
    .skip(skip)
    .limit(limit)
    .lean();

  // --- Total Count ---
  const totalEducators = await UserModel.countDocuments(query);

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(totalEducators / limit),
    totalRecords: totalEducators,
    limit,
  };

  // --- Handle Empty Results ---
  if (!educatorDetails.length) {
    return res.status(200).json(
      GetApiResponse(200, [], pagination, "No educators found")
    );
  }

  // --- Bulk Course Count in ONE Query ---
  const courseCounts = await Course.aggregate([
    { $match: { instructor: { $in: educatorDetails.map((e) => e._id) } } },
    { $group: { _id: "$instructor", count: { $sum: 1 } } },
  ]);

  const courseCountMap = courseCounts.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  // --- Final Response Mapping ---
  const result = educatorDetails.map((ed) => {
    return {
      ...ed,
      courseCount: courseCountMap[ed._id.toString()] || 0,
    };
  });

  return res.status(200).json(
    GetApiResponse(200, result, pagination, "Educator list fetched successfully")
  );
});

