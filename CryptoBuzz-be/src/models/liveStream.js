import mongoose from "mongoose";

const LiveStreamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },

    rtmp_URl: {
      type: String,
    },

    token: {
      type: String,
    },

    callId: {
      type: String,
    },

    datetime: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      default: "pending",
    },

    isLive: {
      type: Boolean,
      default: false,
    },

    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
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
  { timestamps: true }
);

// Soft delete filters
LiveStreamSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

LiveStreamSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

export const LiveStream = mongoose.model("LiveStream", LiveStreamSchema);

export default LiveStream;
