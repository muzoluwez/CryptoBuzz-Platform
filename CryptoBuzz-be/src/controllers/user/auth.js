import bcrypt from "bcryptjs";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import UserCredential from "../../models/userCredential.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { addEmailJob } from "../../utils/emailQueue.js";

export const signup = async (req, res) => {
  try {
    const { name, first_name, last_name, email, password } = req.body;

    // 1️⃣ Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2️⃣ Check existing user
    const existingUser = await UserCredential.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 5️⃣ Create user (unverified)
    const user = await UserCredential.create({
      name,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      uid: uuidv4(),
      subscription: {
        plan: "FREE",
        status: "active",
        expiresAt: null,
      },
      emailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
    });

    // 6️⃣ Enqueue verification email
    try {
      const appUrl =
        process.env.FRONTEND_URL ||
        "http://localhost:5173";
      const verifyLink = `${appUrl}/verify-email?token=${emailVerificationToken}`;

      await addEmailJob("verify-email", {
        name: name || first_name || email,
        email,
        link: verifyLink,
      });
    } catch (queueError) {
      console.error("Failed to enqueue verification email:", queueError);
      // Do not block signup if email queue fails
    }

    // 7️⃣ Remove sensitive fields from response
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.emailVerificationToken;
    delete userObj.emailVerificationExpires;

    return res
      .status(200)
      .json(
        ApiResponse(
          200,
          userObj,
          "Signup successful. Please check your email to verify your account."
        )
      );
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password, uid } = req.body;

    if (uid) {
      // login uid method logic
    }

    // 1️⃣ Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2️⃣ Check existing user
    const existingUser = await UserCredential.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not exists with this email",
      });
    }

    // 3️⃣ Block login if email not verified
    if (!existingUser.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before signing in.",
      });
    }

    const token = jwt.sign(
      { _id: existingUser._id, role: existingUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // 5️⃣ Remove password from response
    const userObj = existingUser.toObject();
    delete userObj.password;

    return res
      .status(200)
      .json(ApiResponse(200, { userObj, token }, "Signin successful"));
  } catch (error) {
    console.error("Signin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Verification token is required" });
    }

    const user = await UserCredential.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res
      .status(200)
      .json(ApiResponse(200, null, "Email verified successfully."));
  } catch (error) {
    console.error("verifyEmail Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
