import { CryptoAnalysis as Crypto } from "../../models/cryptoAnalysis.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { GetApiResponse } from "../../utils/ApiResponse.js";
import Category from "../../models/category.js";

/**
 * @desc    Fetch and return all crypto analysis for the student side
 * @route   GET /api/v1/student/crypto
 * @access  Student (UserCredential)
 */
export const getCryptos = asyncHandler(async (req, res) => {
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

    const [cryptos, totalRecords] = await Promise.all([
        Crypto.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("category", "_id name")
            .populate("createdBy", "_id first_name last_name image")
            .populate("plans", "name price description hotmartCheckoutCode hotmartCheckoutUrl")
            .lean(),
        Crypto.countDocuments(query)
    ]);

    const formattedCryptos = cryptos.map(crypto => ({
        _id: crypto._id,
        title: crypto.title,
        description: crypto.description,
        url: crypto.url,
        photos: crypto.photos || [],
        videoUrl: crypto.videoUrl || null,
        mediaType: crypto.mediaType || (crypto.videoUrl ? "video" : "image"),
        accessType: crypto.accessType,
        plans: crypto.plans || [], // Include populated plans
        createdAt: crypto.createdAt,
        category: crypto.category,
        createdBy: crypto.createdBy
    }));

    const pagination = {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
        currentPage: pageNum,
        limit: limitNum
    };

    return res.status(200).json(GetApiResponse(200, formattedCryptos, pagination, "Crypto analysis fetched successfully"));
});

export default { getCryptos };
