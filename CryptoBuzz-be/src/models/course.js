import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    tier: { type: String, default: "FREE" },
    order: { type: Number, required: true },
    section: { type: String, required: true },
    language: { type: String, required: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    imageUrl: { type: String },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    sections: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Section" }
    ],

    hotmartProductId: {
      type: String,
      default: null,
    },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model("Course", CourseSchema);

export default Course;
