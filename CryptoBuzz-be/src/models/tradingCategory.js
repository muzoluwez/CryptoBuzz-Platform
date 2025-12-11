import mongoose from "mongoose";

const tradingCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: Boolean,
      default: true,
      required: true,
    },

    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const TradingCategoryModel = mongoose.model(
  "TradingCategory",
  tradingCategorySchema
);

export default TradingCategoryModel;
