import mongoose from "mongoose";

const CourseTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    status: {
      type: Boolean,
      default: false,
      required: true,
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

// 🔍 Auto-filter soft deleted records
CourseTypeSchema.pre("find", function () {
  this.where({ isDelete: false });
});

CourseTypeSchema.pre("findOne", function () {
  this.where({ isDelete: false });
});

CourseTypeSchema.pre("countDocuments", function () {
  this.where({ isDelete: false });
});

export const CourseType = mongoose.model("CourseType", CourseTypeSchema);

export default CourseType;
