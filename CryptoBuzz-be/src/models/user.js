import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    first_name: {
      type: String
    },
    last_name: {
      type: String
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String
    },
    image: {
      type: String
    },
    role: {
      type: String,
      enum: ["student", "educator", "admin", "marketer", "super_admin"],
      default: "student",
      required: true
    },
    crm_id: {
      type: String
    },
    bio: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    status: {
      type: String,
      default: false
    },
    is_create_stream: {
      type: Boolean,
      default: false
    },
    ideaCount: {
      type: Number,
      default: 0
    },
    insightCount: {
      type: Number,
      default: 0
    },
    courseCount: {
      type: Number,
      default: 0
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package"
    },

    bannerImage: {
      type: String
    },
    bannerImage: {
      type: String
    },
    callId: {
      type: String
    },

    tier: {
      type: String,
      enum: ["FREE", "PRO", ""],
      default: ""
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      }
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      }
    ],
    postsCount: {
      type: Number,
      default: 0
    },
    likesReceived: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    is_access_trade_ideas: {
      type: Boolean,
      default: false
    },
    is_access_trade_analysis: {
      type: Boolean,
      default: false
    },
    expire_at: {
      type: Date
    },
    projectId: {
      type: String
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    fcm_token: {
      type: String,
      default: null
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      }
    ],
    educatorRole: {
      type: String
    },
    avgRating: {
      type: Number,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual for follower count
// UserSchema.virtual("followerCount").get(function () {
//   return this.followers.length;
// });

// // Virtual for following count
// UserSchema.virtual("followingCount").get(function () {
//   return this.following.length;
// });

// // Update last active
// UserSchema.methods.updateLastActive = function () {
//   this.lastActive = new Date();
//   return this.save({ validateBeforeSave: false });
// };

// // Remove sensitive data when converting to JSON
// UserSchema.methods.toJSON = function () {
//   const user = this.toObject();
//   delete user.password;
//   delete user.__v;
//   return user;
// };

UserSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
UserSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});
UserSchema.pre("countDocuments", function () {
  this.where({ isDeleted: false });
});

export const User = mongoose.model("user", UserSchema);

export default User;
