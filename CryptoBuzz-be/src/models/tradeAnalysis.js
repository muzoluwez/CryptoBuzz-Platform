import mongoose from "mongoose";

const tradeAnalysisSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    url: {
      type: String,
    },

    data: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    photos: [
      {
        type: String, // Stores URLs or file paths
      },
    ],
    accessType: {
      type: String,
      enum: ["PUBLIC", "LOGGED_IN", "UID_ONLY", "PLAN_BASED"],
      default: "PUBLIC",
      required: true
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
  { timestamps: true }
);

// Soft delete middleware
tradeAnalysisSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

tradeAnalysisSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

tradeAnalysisSchema.pre("countDocuments", function () {
  this.where({ isDeleted: false });
});

export const TradeAnalysisModel = mongoose.model(
  "TradeAnalysis",
  tradeAnalysisSchema
);

export default TradeAnalysisModel;
