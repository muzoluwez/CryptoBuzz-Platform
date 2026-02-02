import Plan from "../../models/plan.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * Public endpoint: Get active plans (no auth required)
 */
export const getPublicPlans = async (req, res) => {
  try {
    const { status = 'active', limit = 100, search } = req.query;
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const plans = await Plan.find(query)
      .select('-hotmartProductDetails.secret -hotmartProductDetails.apiKey')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return res.status(200).json(ApiResponse(200, plans, 'Public plans retrieved successfully'));
  } catch (error) {
    console.error('Error getting public plans:', error);
    return res.status(500).json({ message: error.message });
  }
};
