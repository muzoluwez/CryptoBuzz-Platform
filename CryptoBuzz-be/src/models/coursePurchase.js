import mongoose from "mongoose";

const CoursePurchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    hotmartTransactionCode: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    hotmartPurchaseToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled", "refunded"],
      default: "pending",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    paymentMethod: {
      type: String,
      enum: ["hotmart", "other"],
      default: "hotmart",
    },
    hotmartProductId: {
      type: String,
    },
    hotmartBuyerEmail: {
      type: String,
    },
    hotmartBuyerName: {
      type: String,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    accessGranted: {
      type: Boolean,
      default: false,
    },
    accessGrantedAt: {
      type: Date,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CoursePurchaseSchema.index({ user: 1, course: 1 });
CoursePurchaseSchema.index({ hotmartTransactionCode: 1 });
CoursePurchaseSchema.index({ status: 1 });
CoursePurchaseSchema.index({ user: 1, status: 1 });

export const CoursePurchase = mongoose.model("CoursePurchase", CoursePurchaseSchema);
export default CoursePurchase;

