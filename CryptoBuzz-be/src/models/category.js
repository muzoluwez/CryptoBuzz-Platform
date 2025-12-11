import mongoose from "mongoose";
import slugify from "slugify";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
    },
    // image: {
    //   type: String,  
    // },
    // icon: {
    //   type: String,
    // },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    status: {
      type: Boolean,
      default: false,
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

CategorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

CategorySchema.pre("find", function () {
  this.where({ isDeleted: false });
});
CategorySchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

export const Category = mongoose.model("Category", CategorySchema);

export default Category;
