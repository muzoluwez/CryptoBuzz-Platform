import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },

    // Hotmart Integration
    hotmartProductId: {
      type: String,
      // Can be numeric product ID or alphanumeric checkout code
    },
    hotmartCheckoutUrl: {
      type: String,
      required: true,
      // Full checkout URL: https://pay.hotmart.com/{checkoutCode}
      // This is the primary field - checkout code will be extracted from URL
    },
    hotmartCheckoutCode: {
      type: String,
      // Alphanumeric checkout code (e.g., "J103673988Y") - extracted from URL
      // Kept for backward compatibility and quick lookup
    },
    hotmartProductDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Store all available product details from Hotmart API
      // { id, name, description, ... }
    },

    // Status & Metadata
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
PlanSchema.index({ status: 1, isDeleted: 1 });
PlanSchema.index({ hotmartProductId: 1 });
PlanSchema.index({ hotmartCheckoutUrl: 1 });
PlanSchema.index({ hotmartCheckoutCode: 1 });

// Helper function to extract checkout code from URL
const extractCheckoutCodeFromUrl = (url) => {
  if (!url) return null;
  
  // Match pattern: https://pay.hotmart.com/{checkoutCode}
  const match = url.match(/https?:\/\/pay\.hotmart\.com\/([A-Z0-9]+)/i);
  if (match && match[1]) {
    return match[1];
  }
  
  // If URL doesn't match expected pattern, try to extract last segment
  const segments = url.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (lastSegment && /^[A-Z0-9]+$/i.test(lastSegment)) {
    return lastSegment.toUpperCase();
  }
  
  return null;
};

// Pre-save hook to extract checkout code from URL
PlanSchema.pre("save", async function () {
  if (this.hotmartCheckoutUrl && !this.hotmartCheckoutCode) {
    const extractedCode = extractCheckoutCodeFromUrl(this.hotmartCheckoutUrl);
    if (extractedCode) {
      this.hotmartCheckoutCode = extractedCode;
    }
  }
});

// Soft delete middleware
PlanSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

PlanSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

PlanSchema.pre("countDocuments", function () {
  this.where({ isDeleted: false });
});

export const Plan = mongoose.model("Plan", PlanSchema);
export default Plan;
