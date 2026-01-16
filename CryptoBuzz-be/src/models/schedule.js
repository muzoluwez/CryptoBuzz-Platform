import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
    },

    thumbnail: {
      type: String,
    },

    description: {
      type: String,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "pending",
    },

    accessType: {
      type: String,
      enum: ["PUBLIC", "LOGGED_IN", "UID_ONLY", "PLAN_BASED"],
      default: "LOGGED_IN",
    },

    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    recurrenceRuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurrenceRule",
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    tags: {
      type: [String],
      required: true,
    },

    datetime: {
      type: Date,
      required: true,
    },

    generateToken: {
      type: Boolean,
      default: false,
    },

    callId: {
      type: String,
      default: null,
    },

    create_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    liveStreamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveStream",
      default: null,
    },

    isLiveStreamProcessing: {
      type: Boolean,
      default: false,
    },

    isRecurent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Soft delete filtering
ScheduleSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

ScheduleSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

export const Schedule = mongoose.model("Schedule", ScheduleSchema);

export default Schedule;
