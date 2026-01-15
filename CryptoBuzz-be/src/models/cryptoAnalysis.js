
import mongoose from "mongoose";

const cryptoAnalysisSchema = new mongoose.Schema(
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
        type: String, // Image URLs
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

// Soft delete filters
cryptoAnalysisSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

cryptoAnalysisSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

cryptoAnalysisSchema.pre("countDocuments", function () {
  this.where({ isDeleted: false });
});

export const CryptoAnalysis = mongoose.model("cryptoAnalysis", cryptoAnalysisSchema);

export default CryptoAnalysis;
