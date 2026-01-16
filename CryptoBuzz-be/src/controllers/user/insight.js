import { TradeAnalysisModel } from "../../models/tradeAnalysis.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { GetApiResponse } from "../../utils/ApiResponse.js";
import Category from "../../models/category.js";

export const getInsights = asyncHandler(async (req, res) => {
    const {
        categoryName,
        page = 1,
        limit = 10,
        startDate,
        endDate
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {
        isDeleted: false
    };

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) throw ApiError(400, "Invalid startDate format");
            query.createdAt.$gte = start;
        }
        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) throw ApiError(400, "Invalid endDate format");
            query.createdAt.$lte = end;
        }
    }

    if (categoryName) {
        const categories = await Category.find({
            name: { $regex: categoryName, $options: "i" }
        }).select("_id");
        query.category = { $in: categories.map(cat => cat._id) };
    }

    const [insights, totalRecords] = await Promise.all([
        TradeAnalysisModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("category", "_id name")
            .populate("createdBy", "_id first_name last_name image")
            .populate("plans", "name price description hotmartCheckoutCode hotmartCheckoutUrl")
            .lean(),
        TradeAnalysisModel.countDocuments(query)
    ]);

    const formattedInsights = insights.map(insight => ({
        _id: insight._id,
        title: insight.title,
        description: insight.description,
        url: insight.url,
        photos: insight.photos,
        accessType: insight.accessType,
        plans: insight.plans || [], // Include populated plans
        createdAt: insight.createdAt,
        category: insight.category,
        createdBy: insight.createdBy
    }));

    const pagination = {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
        currentPage: pageNum,
        limit: limitNum
    };

    return res.status(200).json(GetApiResponse(200, formattedInsights, pagination, "Insights fetched successfully"));
});

export default { getInsights };
