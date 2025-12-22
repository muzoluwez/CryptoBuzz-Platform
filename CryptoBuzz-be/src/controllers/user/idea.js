import { ideaModel as Idea } from "../../models/idea.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { GetApiResponse } from "../../utils/ApiResponse.js";
import Category from "../../models/category.js";

export const getIdeas = asyncHandler(async (req, res) => {
    const {
        categoryName,
        status,
        ideaType,
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

    if (status) {
        query.status = status;
    }

    if (ideaType) {
        query.type = ideaType;
    }

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                throw ApiError(400, "Invalid startDate format");
            }
            query.createdAt.$gte = start;
        }
        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                throw ApiError(400, "Invalid endDate format");
            }
            query.createdAt.$lte = end;
        }
    }

    if (categoryName) {
        const categories = await Category.find({
            name: { $regex: categoryName, $options: "i" }
        }).select("_id");

        const categoryIds = categories.map(cat => cat._id);
        query.category = { $in: categoryIds };
    }

    const [ideas, totalRecords] = await Promise.all([
        Idea.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("category", "_id name")
            .populate("educatorId", "_id first_name last_name image")
            .select("-__v -isDeleted -deletedAt")
            .lean(),
        Idea.countDocuments(query)
    ]);

    const formattedIdeas = ideas.map(idea => ({
        _id: idea._id,
        name: idea.name,
        image: idea.image,
        image_Url: idea.image_Url,
        type: idea.type,
        timeFrame: idea.timeFrame,
        description: idea.description,
        status: idea.status,
        entry: idea.entry,
        invalidation: idea.invalidation,
        pips: idea.pips,
        exits: idea.exits,
        accessType: idea.accessType,
        createdAt: idea.createdAt,
        category: idea.category,
        educator: idea.educatorId
    }));

    const pagination = {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
        currentPage: pageNum,
        limit: limitNum
    };

    return res
        .status(200)
        .json(GetApiResponse(200, formattedIdeas, pagination, "Ideas fetched successfully"));
});

export default {
    getIdeas
};
