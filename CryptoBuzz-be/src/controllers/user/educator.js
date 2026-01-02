import UserModel from "../../models/user.js";
import { Course } from "../../models/course.js";
import Idea from "../../models/idea.js";
import TradeAnalysis from "../../models/tradeAnalysis.js";
import Schedule from "../../models/schedule.js";
import Recording from "../../models/recording.js";
import Post from "../../models/socialPost.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";
import { getSignedUrl } from "../../utils/azureUploader.js";

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
      { email: new RegExp(search, "i") }
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
    .select("-password -following -postsCount -likesReceived -isDeleted -createdAt -updatedAt -deletedAt")
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
    limit
  };

  // --- Handle Empty Results ---
  if (!educatorDetails.length) {
    return res.status(200).json(GetApiResponse(200, [], pagination, "No educators found"));
  }

  // --- Bulk Course Count in ONE Query ---
  const courseCounts = await Course.aggregate([
    { $match: { instructor: { $in: educatorDetails.map(e => e._id) } } },
    { $group: { _id: "$instructor", count: { $sum: 1 } } }
  ]);

  const courseCountMap = courseCounts.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  // --- Final Response Mapping ---
  const result = educatorDetails.map(ed => {
    return {
      ...ed,
      courseCount: courseCountMap[ed._id.toString()] || 0
    };
  });

  return res.status(200).json(GetApiResponse(200, result, pagination, "Educator list fetched successfully"));
});

// Helper function to normalize blob name
function normalizeBlobName(blobName) {
  try {
    const url = new URL(blobName);
    return url.pathname.split("/").pop();
  } catch {
    return blobName;
  }
}

export const getEducatorDetails = asyncHandler(async (req, res) => {
  const educatorId = req.params.educatorId;
  // const user = req.user;

  // if (!user) {
  //   throw new ApiError(400, "User not found");
  // }

  if (!educatorId) {
    throw new ApiError(400, "Educator ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(educatorId)) {
    throw new ApiError(400, "Invalid educator ID format");
  }

  // Get user's allowed categories from plan
  // Check if plan is already populated in req.user, otherwise fetch it
  let allowedCategoryIds = [];
  // if (user.plan && typeof user.plan === 'object' && user.plan.allowedCategories) {
  //   // Plan is already populated
  //   allowedCategoryIds = user.plan.allowedCategories || [];
  // } else if (user.plan) {
  //   // Plan is just an ID, need to populate
  //   const userPlan = await UserModel.findById(user._id)
  //     .select("plan")
  //     .populate("plan", "allowedCategories")
  //     .lean();
  //   allowedCategoryIds = userPlan?.plan?.allowedCategories || [];
  // }

  // const objectIds = allowedCategoryIds
  //   .filter(id => mongoose.Types.ObjectId.isValid(id))
  //   .map((id) => new mongoose.Types.ObjectId(id));

  // Fetch educator details
  const educatorDetails = await UserModel.findById(educatorId)
    .select("first_name last_name email image role bannerImage status description avgRating ratingCount")
    .lean();

  if (!educatorDetails) {
    throw new ApiError(404, "Educator not found");
  }

  // Format educator response
  const educatorResponse = {
    _id: educatorDetails._id,
    first_name: educatorDetails.first_name,
    last_name: educatorDetails.last_name,
    email: educatorDetails.email,
    image: educatorDetails.image,
    role: educatorDetails.role,
    bannerImage: educatorDetails.bannerImage
      ? educatorDetails.bannerImage
      : `${process.env.URL || ""}assets/default_banner.jpg`,
    description: educatorDetails.description,
    status: educatorDetails.status,
    avgRating: educatorDetails.avgRating || 0,
    ratingCount: educatorDetails.ratingCount || 0
  };

  // Run all DB queries in parallel for better performance
  const [liveIdeas, courses, insights, ideas, recordings, liveFeed, analysisUpdates] = await Promise.all([
    // Live Ideas (using Idea model with status 'active')
    Idea.find({
      educatorId: new mongoose.Types.ObjectId(educatorId),
      status: "active"
    })
      .sort({ createdAt: -1 })
      .populate("educatorId", "first_name last_name image _id")
      .populate("category", "name _id")
      .lean(),

    // Courses - filter by allowed categories
    Course.find({
      // category: { $in: objectIds.length > 0 ? objectIds : [] },
      createdBy: new mongoose.Types.ObjectId(educatorId),
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .populate("instructor", "first_name last_name email image role")
      .populate("sections")
      .populate("category", "name _id")
      .lean(),

    // Insights (Trade Analysis) - filter by allowed categories
    TradeAnalysis.find({
      // category: { $in: objectIds.length > 0 ? objectIds : [] },
      createdBy: new mongoose.Types.ObjectId(educatorId),
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "first_name last_name image _id")
      .populate("category", "name _id")
      .lean(),

    // Ideas
    Idea.find({
      educatorId: new mongoose.Types.ObjectId(educatorId),
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .populate("educatorId", "first_name last_name image _id")
      .populate("category", "name _id")
      .lean(),

    // Recordings
    Recording.find({
      educator_id: educatorId
    })
      .sort({ createdAt: -1 })
      .lean(),

    // Live Feed (General Posts)
    Post.find({
      author: new mongoose.Types.ObjectId(educatorId),
      category: "General Updates"
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("author", "first_name last_name image bio role")
      .lean(),

    // Analysis Updates (Posts with category "Analysis Updates")
    Post.find({
      author: new mongoose.Types.ObjectId(educatorId),
      category: "Analysis Updates"
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("author", "first_name last_name image bio role")
      .lean()
  ]);

  // Generate signed URLs for recordings
  const recordingsWithSignedUrls = await Promise.all(
    recordings.map(async rec => {
      if (rec.url) {
        try {
          const cleanName = normalizeBlobName(rec.url);
          rec.url = await getSignedUrl(cleanName);
        } catch (error) {
          console.error(`Error generating signed URL for recording ${rec._id}:`, error);
          // Fallback to videoUrl if signed URL generation fails
          rec.url = rec.videoUrl || null;
        }
      } else {
        rec.url = rec.videoUrl || null;
      }
      return rec;
    })
  );

  return res.status(200).json(
    ApiResponse(
      200,
      {
        educator: educatorResponse,
        liveIdeas,
        courses,
        insights,
        ideas,
        recordings: recordingsWithSignedUrls,
        liveFeed, // General Updates posts
        analysisUpdates // Analysis Updates posts
      },
      "Educator details with courses, ideas, recordings, insights, analysis updates, live feed, and schedules fetched successfully"
    )
  );
});
