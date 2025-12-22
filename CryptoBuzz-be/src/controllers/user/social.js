import { Post } from "../../models/socialPost.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { GetApiResponse } from "../../utils/ApiResponse.js";


export const getSocials = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        category
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {
        visibility: "public"
    };

    if (category) {
        query.category = category;
    }

    const [posts, totalRecords] = await Promise.all([
        Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("author", "_id first_name last_name image")
            .lean(),
        Post.countDocuments(query)
    ]);

    const pagination = {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
        currentPage: pageNum,
        limit: limitNum
    };

    return res.status(200).json(GetApiResponse(200, posts, pagination, "Social posts fetched successfully"));
});

export default { getSocials };
