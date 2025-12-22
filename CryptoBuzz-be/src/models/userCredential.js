import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["FREE", "MAX", "PRO"],
      default: "FREE",
      required: true
    },

    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
      required: true
    },

    expiresAt: {
      type: Date,
      default: null
    }
  },
  { _id: false } // subdocument ke liye
);

const UserCredentialSchema = new mongoose.Schema(
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
    uid: {
      type: String,
      unique: true,
      sparse: true, // optional but unique
      index: true
    },

    status: {
      type: String,
      default: false
    },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      }
    ],
    lastActive: {
      type: Date,
      default: Date.now
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
    subscription: {
      type: SubscriptionSchema,
      default: () => ({})
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserCredentialSchema.pre("find", function () {
  this.where({ isDeleted: false });
});
UserCredentialSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});
UserCredentialSchema.pre("countDocuments", function () {
  this.where({ isDeleted: false });
});

const UserCredential = mongoose.model("userCredential", UserCredentialSchema);

export { UserCredential };
export default UserCredential;
