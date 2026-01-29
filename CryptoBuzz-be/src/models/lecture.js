import mongoose from "mongoose";

const LectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    description: { type: String },

    content: { type: String },

    order: { type: Number },

    type: { type: String, default: "VIDEO" },

    preview: { type: Boolean, default: false },

    thumbnailUrl: { type: String },

    videoUrl: { type: String },

    duration: { type: String },

    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    // completions: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "LectureCompletion",
    //   },
    // ],
  },
  { timestamps: true }
);

export const Lecture = mongoose.model("Lecture", LectureSchema);

export default Lecture;
