import Rating from "../../models/rating.js";
import User from "../../models/user.js";
import moment from "moment";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const rateEducator = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  if (!userId) {
    throw new ApiError(400, "User not found");
  }

  const { educator, rating, comment } = req.body;

  if (!educator) {
    throw new ApiError(400, "Educator not found");
  }

  if (userId.toString() === educator.toString()) {
    throw new ApiError(400, "You cannot rate yourself.");
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1–5.");
  }

  const start = moment().startOf("day").toDate();
  const end = moment().endOf("day").toDate();

  const alreadyRated = await Rating.findOne({
    user: userId,
    educator,
    createdAt: { $gte: start, $lte: end },
    isDeleted: false,
  });

  if (alreadyRated) {
    throw new ApiError(400, "You already rated this educator today.");
  }

  const userRating = await Rating.create({
    user: userId,
    educator,
    rating,
    comment,
  });

  const stats = await Rating.aggregate([
    { $match: { educator: userRating.educator, isDeleted: false } },
    {
      $group: {
        _id: "$educator",
        avgRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length) {
    await User.findByIdAndUpdate(educator, {
      avgRating: stats[0].avgRating,
      ratingCount: stats[0].ratingCount,
    });
  }

  return res.status(201).json(
    ApiResponse(201, userRating, "Rating submitted successfully.")
  );
});

export default { rateEducator };

