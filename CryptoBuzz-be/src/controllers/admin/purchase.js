import CoursePurchase from "../../models/coursePurchase.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * Get all course purchases (Admin only)
 * Supports filtering by status, course, user, and date range
 */
export const getAllPurchases = async (req, res) => {
  try {
    const { 
      status, 
      courseId, 
      userId, 
      startDate, 
      endDate,
      search,
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    // By default, only show purchases with transaction codes (completed payments)
    // unless explicitly filtering by status or user wants to see all
    const query = {};
    
    // If no status filter is provided, default to showing only approved purchases
    // Admin can explicitly filter to see pending/cancelled/refunded if needed
    if (status) {
      query.status = status;
      // For approved purchases, ensure transaction code exists (completed payments)
      if (status === "approved") {
        query.hotmartTransactionCode = { $exists: true, $ne: null, $ne: "" };
      }
    } else {
      // Default: only show approved purchases (completed transactions)
      query.status = "approved";
      // Also ensure transaction code exists (additional safety check)
      query.hotmartTransactionCode = { $exists: true, $ne: null, $ne: "" };
    }

    if (courseId) {
      query.course = courseId;
    }

    if (userId) {
      query.user = userId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // If search is provided, use aggregation to search across referenced user fields
    let purchases, total;
    
    if (search) {
      // Use aggregation pipeline for searching in populated user fields
      const aggregationPipeline = [
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userData"
          }
        },
        {
          $match: {
            $or: [
              { hotmartBuyerEmail: { $regex: search, $options: "i" } },
              { hotmartBuyerName: { $regex: search, $options: "i" } },
              { hotmartTransactionCode: { $regex: search, $options: "i" } },
              { "userData.email": { $regex: search, $options: "i" } },
              { "userData.first_name": { $regex: search, $options: "i" } },
              { "userData.last_name": { $regex: search, $options: "i" } },
            ]
          }
        },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseData"
          }
        },
        {
          $project: {
            _id: 1,
            user: { $arrayElemAt: ["$userData", 0] },
            course: { $arrayElemAt: ["$courseData", 0] },
            hotmartTransactionCode: 1,
            status: 1,
            amount: 1,
            currency: 1,
            hotmartProductId: 1,
            hotmartBuyerEmail: 1,
            hotmartBuyerName: 1,
            purchaseDate: 1,
            accessGranted: 1,
            accessGrantedAt: 1,
            metadata: 1,
            createdAt: 1,
            updatedAt: 1,
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ];
      
      // Get count for search results
      const countPipeline = [
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userData"
          }
        },
        {
          $match: {
            $or: [
              { hotmartBuyerEmail: { $regex: search, $options: "i" } },
              { hotmartBuyerName: { $regex: search, $options: "i" } },
              { hotmartTransactionCode: { $regex: search, $options: "i" } },
              { "userData.email": { $regex: search, $options: "i" } },
              { "userData.first_name": { $regex: search, $options: "i" } },
              { "userData.last_name": { $regex: search, $options: "i" } },
            ]
          }
        },
        { $count: "total" }
      ];
      
      const countResult = await CoursePurchase.aggregate(countPipeline);
      total = countResult[0]?.total || 0;
      
      purchases = await CoursePurchase.aggregate(aggregationPipeline);
    } else {
      // No search - use regular find with populate
      total = await CoursePurchase.countDocuments(query);
      
      purchases = await CoursePurchase.find(query)
        .populate("user", "first_name last_name email image")
        .populate("course", "title description imageUrl price tier")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
    }

    // Calculate summary stats - only count purchases with transaction codes for completed transactions
    // These stats are for ALL purchases (not filtered by current query) to show overall metrics
    const statsQuery = { hotmartTransactionCode: { $exists: true, $ne: null, $ne: "" } };
    const [totalStats, approvedStats, pendingStats, cancelledStats, refundedStats, revenueResult] = await Promise.all([
      CoursePurchase.countDocuments(statsQuery),
      CoursePurchase.countDocuments({ ...statsQuery, status: "approved" }),
      CoursePurchase.countDocuments({ status: "pending" }),
      CoursePurchase.countDocuments({ ...statsQuery, status: "cancelled" }),
      CoursePurchase.countDocuments({ ...statsQuery, status: "refunded" }),
      CoursePurchase.aggregate([
        { $match: { status: "approved", hotmartTransactionCode: { $exists: true, $ne: null, $ne: "" } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);
    
    const stats = {
      total: totalStats,
      approved: approvedStats,
      pending: pendingStats,
      cancelled: cancelledStats,
      refunded: refundedStats,
      totalRevenue: revenueResult[0]?.total || 0,
    };

    return res.status(200).json(
      ApiResponse(200, {
        purchases,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
        stats,
      }, "Purchases retrieved successfully")
    );
  } catch (error) {
    console.error("Error getting all purchases:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Get single purchase by ID (Admin only)
 */
export const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await CoursePurchase.findById(id)
      .populate("user", "first_name last_name email image")
      .populate("course", "title description imageUrl price tier");

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    return res.status(200).json(
      ApiResponse(200, purchase, "Purchase retrieved successfully")
    );
  } catch (error) {
    console.error("Error getting purchase by ID:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
