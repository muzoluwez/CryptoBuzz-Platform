import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },

    description: { 
      type: String 
    },

    order: { 
      type: Number 
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      }
    ],

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

export const Section = mongoose.model("Section", SectionSchema);

export default Section;
