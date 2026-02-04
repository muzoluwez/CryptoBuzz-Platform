import Plan from "../../models/plan.js";
import { getHotmartProducts } from "../../utils/hotmartService.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadImageToAzure, deleteImageFromAzure } from "../../utils/azureUploader.js";
import * as yup from "yup";

// Helper function to extract checkout code from URL
const extractCheckoutCodeFromUrl = (url) => {
  if (!url) return null;
  
  // Match pattern: https://pay.hotmart.com/{checkoutCode}
  const match = url.match(/https?:\/\/pay\.hotmart\.com\/([A-Z0-9]+)/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }
  
  // If URL doesn't match expected pattern, try to extract last segment
  const segments = url.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (lastSegment && /^[A-Z0-9]+$/i.test(lastSegment)) {
    return lastSegment.toUpperCase();
  }
  
  return null;
};

// Validation schema
const planValidationSchema = yup.object().shape({
  name: yup.string().required("Plan name is required"),
  description: yup.string().nullable(),
  price: yup.number().min(0).required("Price is required"),
  currency: yup.string().default("USD"),
  image: yup.string().nullable(),
  hotmartProductId: yup.string().nullable(),
  hotmartCheckoutUrl: yup
    .string()
    .required("Hotmart checkout URL is required")
    .url("Must be a valid URL")
    .matches(
      /^https?:\/\/pay\.hotmart\.com\/[A-Z0-9]+$/i,
      "Must be a valid Hotmart checkout URL (e.g., https://pay.hotmart.com/J103673988Y)"
    ),
  hotmartCheckoutCode: yup.string().nullable(), // Will be auto-extracted
  hotmartProductDetails: yup.object().nullable(),
  status: yup.string().oneOf(["active", "inactive"]).default("active"),
});

/**
 * Get all plans
 */
export const getPlans = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { hotmartCheckoutUrl: { $regex: search, $options: "i" } },
        { hotmartCheckoutCode: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const plans = await Plan.find(query)
      .populate("createdBy", "first_name last_name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(
      ApiResponse(200, plans, "Plans retrieved successfully")
    );
  } catch (error) {
    console.error("Error getting plans:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Get single plan by ID
 */
export const getPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id).populate(
      "createdBy",
      "first_name last_name email"
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    return res.status(200).json(
      ApiResponse(200, plan, "Plan retrieved successfully")
    );
  } catch (error) {
    console.error("Error getting plan:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Create new plan
 * Fetches Hotmart products and allows selection
 */
export const createPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const planData = {
      ...req.body,
      createdBy: userId,
    };

    // Handle image upload
    if (req.file) {
      const azureUrl = await uploadImageToAzure(req.file.buffer, req.file.originalname);
      planData.image = azureUrl;
    }

    // Extract checkout code from URL if URL is provided
    if (planData.hotmartCheckoutUrl) {
      const extractedCode = extractCheckoutCodeFromUrl(planData.hotmartCheckoutUrl);
      if (extractedCode) {
        planData.hotmartCheckoutCode = extractedCode;
      } else {
        return res.status(400).json({
          message: "Invalid Hotmart checkout URL. Could not extract checkout code. URL should be in format: https://pay.hotmart.com/J103673988Y",
        });
      }
    }

    await planValidationSchema.validate(planData);

    // Check if checkout URL already exists
    const existingPlanByUrl = await Plan.findOne({
      hotmartCheckoutUrl: planData.hotmartCheckoutUrl,
    });

    if (existingPlanByUrl) {
      return res.status(400).json({
        message: "Plan with this checkout URL already exists",
      });
    }

    // Also check by checkout code for uniqueness
    if (planData.hotmartCheckoutCode) {
      const existingPlanByCode = await Plan.findOne({
        hotmartCheckoutCode: planData.hotmartCheckoutCode,
      });

      if (existingPlanByCode) {
        return res.status(400).json({
          message: "Plan with this checkout code already exists",
        });
      }
    }

    const plan = await Plan.create(planData);

    const populated = await Plan.findById(plan._id).populate(
      "createdBy",
      "first_name last_name email"
    );

    return res.status(201).json(
      ApiResponse(201, populated, "Plan created successfully")
    );
  } catch (error) {
    console.error("Error creating plan:", error);
    return res.status(500).json({
      message: error.errors?.[0] || error.message,
    });
  }
};

/**
 * Update plan
 */
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const existingPlan = await Plan.findById(id);
    if (!existingPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Handle image upload
    if (req.file) {
      // Delete old image from Azure if it exists
      if (existingPlan.image) {
        await deleteImageFromAzure(existingPlan.image);
      }
      // Upload new image to Azure
      const azureUrl = await uploadImageToAzure(req.file.buffer, req.file.originalname);
      updateData.image = azureUrl;
    }

    // Extract checkout code from URL if URL is provided
    if (updateData.hotmartCheckoutUrl) {
      const extractedCode = extractCheckoutCodeFromUrl(updateData.hotmartCheckoutUrl);
      if (extractedCode) {
        updateData.hotmartCheckoutCode = extractedCode;
      } else {
        return res.status(400).json({
          message: "Invalid Hotmart checkout URL. Could not extract checkout code. URL should be in format: https://pay.hotmart.com/J103673988Y",
        });
      }
    }

    // Check if checkout URL already exists (excluding current plan)
    if (
      updateData.hotmartCheckoutUrl &&
      updateData.hotmartCheckoutUrl !== existingPlan.hotmartCheckoutUrl
    ) {
      const duplicatePlanByUrl = await Plan.findOne({
        hotmartCheckoutUrl: updateData.hotmartCheckoutUrl,
        _id: { $ne: id },
      });

      if (duplicatePlanByUrl) {
        return res.status(400).json({
          message: "Plan with this checkout URL already exists",
        });
      }
    }

    // Also check by checkout code for uniqueness
    if (
      updateData.hotmartCheckoutCode &&
      updateData.hotmartCheckoutCode !== existingPlan.hotmartCheckoutCode
    ) {
      const duplicatePlanByCode = await Plan.findOne({
        hotmartCheckoutCode: updateData.hotmartCheckoutCode,
        _id: { $ne: id },
      });

      if (duplicatePlanByCode) {
        return res.status(400).json({
          message: "Plan with this checkout code already exists",
        });
      }
    }

    await planValidationSchema.validate(
      { ...existingPlan.toObject(), ...updateData },
      { abortEarly: false }
    );

    const updatedPlan = await Plan.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("createdBy", "first_name last_name email");

    return res.status(200).json(
      ApiResponse(200, updatedPlan, "Plan updated successfully")
    );
  } catch (error) {
    console.error("Error updating plan:", error);
    return res.status(500).json({
      message: error.errors?.[0] || error.message,
    });
  }
};

/**
 * Delete plan (soft delete)
 */
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Soft delete
    plan.isDeleted = true;
    plan.deletedAt = new Date();
    await plan.save();

    return res.status(200).json(
      ApiResponse(200, null, "Plan deleted successfully")
    );
  } catch (error) {
    console.error("Error deleting plan:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Get Hotmart products (for plan creation/editing)
 * This endpoint fetches products from Hotmart API
 */
export const getHotmartProductsForPlan = async (req, res) => {
  try {
    const productsData = await getHotmartProducts();
    return res.status(200).json(
      ApiResponse(200, productsData, "Hotmart products fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching Hotmart products:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch Hotmart products",
    });
  }
};
