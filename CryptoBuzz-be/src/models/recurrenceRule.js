import mongoose from "mongoose";

const recurrenceRuleSchema = new mongoose.Schema(
  {
    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },

    // Frequency
    frequency: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "NONE"],
      default: "NONE",
      required: true,
    },

    // Repeat every X interval
    interval: {
      type: Number,
      default: 1,
      min: 1,
    },

    // WEEKLY only
    byWeekday: [
      {
        type: String,
        enum: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"],
      },
    ],

    // End limit options
    hasEndLimit: {
      type: Boolean,
      default: false,
    },

    endType: {
      type: String,
      enum: ["OCCURRENCES", "DATE", null],
      default: null,
    },

    occurrences: {
      type: Number,
      min: 1,
      default: null,
    },

    endDateTime: {
      type: Date,
      default: null,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const RecurrenceRule = mongoose.model("RecurrenceRule", recurrenceRuleSchema);

export default RecurrenceRule;
