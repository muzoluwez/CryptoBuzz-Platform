import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    position: {
      type: String,
      enum: ["left", "right"],
      required: true,
      // Removed unique constraint to allow soft-delete functionality
      // Uniqueness is handled in controller logic
    },

    desktopImage: {
      type: String,
      required: true,
    },

    mobileImage: {
      type: String,
      required: true,
    },

    link: {
      type: String,
      default: "",
    },

    openInNewTab: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: true,
    },

    isDelete: {
      type: Boolean,
      default: false,
    },

    deleteAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries (non-unique, allows multiple banners per position)
bannerSchema.index({ position: 1, status: 1, isDelete: 1 });

export const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
