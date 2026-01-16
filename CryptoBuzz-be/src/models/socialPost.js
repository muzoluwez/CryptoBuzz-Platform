import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Post must have an author"],
    },

    content: {
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

    hashtags: [
      {
        type: String,
        lowercase: true,
      },
    ],

    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        content: { type: String, required: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    shares: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    category: {
      type: String,
      enum: ["General Updates", "Analysis Updates"],
      default: "General Updates",
    },

    isEdited: { type: Boolean, default: false },
    editedAt: Date,

    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },

    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },
    accessType: {
      type: String,
      enum: ["PUBLIC", "LOGGED_IN", "UID_ONLY", "PLAN_BASED"],
      default: "PUBLIC",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

postSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

postSchema.virtual("shareCount").get(function () {
  return this.shares.length;
});

postSchema.virtual("timeAgo").get(function () {
  const diff = Date.now() - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "now";
});

// Extract hashtags and mentions
postSchema.pre("save", async function () {
  if (this.isModified("content")) {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;

    while ((match = hashtagRegex.exec(this.content)) !== null) {
      hashtags.push(match[1].toLowerCase());
    }

    this.hashtags = [...new Set(hashtags)];

    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    while ((match = mentionRegex.exec(this.content)) !== null) {
      mentions.push(match[1]);
    }

    // Mention usernames → userIds mapping 
  }
});

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ "likes.user": 1 });
postSchema.index({ category: 1, createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);
export default Post;
