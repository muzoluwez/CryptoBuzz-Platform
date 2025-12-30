import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      trim: true,
      default: null
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userCredential",
      required: true
    },

    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Index
RatingSchema.index({ user: 1, educator: 1, createdAt: 1 });

const Rating = mongoose.model("Rating", RatingSchema);

export default Rating;
