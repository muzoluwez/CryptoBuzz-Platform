import mongoose from "mongoose";

const IdeaSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    image: [
      {
        type: String
        // required: true,
      }
    ],
    image_Url: {
      type: String
      // required: true,
    },

    type: {
      type: String,
      enum: ["buy", "sell"],
      required: true
    },

    timeFrame: [
      {
        type: String,
        enum: ["scalping", "intraday", "swing"]
      }
    ],
    description: {
      type: String,
      required: true
    },
    educatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    status: {
      type: String,
      enum: ["active", "pending", "win", "partialWin", "loss", "breakEven"],
      required: true
    },
    entry: {
      type: String,
      required: true
    },
    invalidation: {
      type: Number,
      required: true
    },
    pips: {
      type: Number
    },
    exits: [
      {
        type: String,
        required: true
      }
    ],
    accessType: {
      type: String,
      enum: ["PUBLIC", "LOGGED_IN", "UID_ONLY", "PLAN_BASED"],
      default: "PUBLIC",
      required: true
    },

    // Only for PLAN_BASED access
    allowedPlans: {
      type: [String],
      enum: ["MAX", "PRO"],
      default: []
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

IdeaSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
IdeaSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

IdeaSchema.pre("countDocuments", function () {
  this.where({ isDeleted: false });
});

export const ideaModel = mongoose.model("idea", IdeaSchema);

export default ideaModel;
