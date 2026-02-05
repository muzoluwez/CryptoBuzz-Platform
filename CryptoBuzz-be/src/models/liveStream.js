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

    // Access control - same tier system as other modules
    tier: {
      type: String,
      enum: ["PUBLIC", "LOGGED_IN", "UID_ONLY", "PRO"],
      default: "PUBLIC",
    },

    // Plans array - Live Stream can belong to multiple plans (same as Courses)
    plans: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    }],

    // How the educator streams: obs (RTMP) or webrtc (browser)
    streamType: {
      type: String,
      enum: ["obs", "webrtc"],
      default: "obs",
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
