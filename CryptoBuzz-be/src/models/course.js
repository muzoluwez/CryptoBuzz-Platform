import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    tier: { 
      type: String, 
      enum: ["PUBLIC", "LOGGED_IN", "UID_ONLY", "PRO"],
      default: "PUBLIC" 
    },
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

    // Plans array - a course can belong to multiple plans
    plans: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    }],
    
    // Legacy single plan field - kept for backward compatibility
    // Will be populated from plans array if only one plan exists
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },

    // Legacy field - keep for backward compatibility during migration
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
