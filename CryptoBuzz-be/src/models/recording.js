import mongoose from "mongoose";

const RecordingSchema = new mongoose.Schema(
  {
    educator_id: { type: String, required: true },

    streamio_filename: { type: String, },

    thumbnail: { type: String },

    session_id: { type: String, required: true },

    filename: { type: String },

    videoUrl: { type: String, default: "" },

    url: { type: String },

    dyntube_id: { type: String },

    dyntubeVideoKey: { type: String },

    start_time: { type: Date, required: true },

    end_time: { type: Date, required: true },

    call_id: { type: String, required: true },

    call_title: { type: String },

    call_description: { type: String },

    call_category: { type: String },

    call_tags: { type: [String] },

    is_temp: { type: Boolean, default: false },

    is_publish: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Recording = mongoose.model("Recording", RecordingSchema);

export default Recording;
