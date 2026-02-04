const mongoose = require("mongoose");

const EmailJobSchema = new mongoose.Schema(
  {
    bullJobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    jobName: {
      type: String,
      required: true,
      enum: [
        "welcome",
        "join-request",
        "join-request-accepted",
        "platform-purchase-success",
        "plan-invoice",
        "community-purchase-success",
        "community-invoice",
        "subscription-cancelled",
        "access-rejected",
        "reset-password",
        "new_livestream_scheduled_bulk",
        "community-invitation",
        "verify-email",
      ],
    },
    payload: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "in-progress", "success", "failed"],
      default: "queued",
      index: true,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    successTimestamp: {
      type: Date,
      default: null,
    },
    lastFailureTimestamp: {
      type: Date,
      default: null,
    },
    errorLogs: [
      {
        _id: false,
        error: String,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

const EmailJob = mongoose.model("EmailJob", EmailJobSchema);

module.exports = EmailJob;
