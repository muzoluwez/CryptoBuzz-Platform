import mongoose from "mongoose";

const RecurrenceScheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },

    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    recurrenceRuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurrenceRule",
    },

    datetime: {
      type: Date,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    language: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

// Soft delete filters
RecurrenceScheduleSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

RecurrenceScheduleSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

export const RecurrenceSchedule = mongoose.model(
  "RecurrenceSchedule",
  RecurrenceScheduleSchema
);

export default RecurrenceSchedule;
