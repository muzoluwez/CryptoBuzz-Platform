import mongoose from "mongoose";

const languageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    isDelete: {
      type: Boolean,
      default: false,
      required: true,
    },

    status: {
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

export const Language = mongoose.model("Language", languageSchema);

export default Language;
