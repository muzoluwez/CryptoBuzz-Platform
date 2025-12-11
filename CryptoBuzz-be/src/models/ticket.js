import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Post must have an author"],
    },

    title: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    images: [
      {
        url: String,
      },
    ],

    videos: [
      {
        url: String,
      },
    ],

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
ticketSchema.index({ author: 1, createdAt: -1 });
ticketSchema.index({ createdAt: -1 });

export const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
