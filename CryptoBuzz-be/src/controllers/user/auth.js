import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import UserCredential from "../../models/userCredential.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const signup = async (req, res) => {
  try {
    const { name, first_name, last_name, email, password } = req.body;

    // 1️⃣ Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // 2️⃣ Check existing user
    const existingUser = await UserCredential.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create user
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
        expiresAt: null
      }
    });

    // 5️⃣ Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json(ApiResponse(200, userObj, "Signup successful"));
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
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
        message: "Email and password are required"
      });
    }

    // 2️⃣ Check existing user
    const existingUser = await UserCredential.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not exists with this email"
      });
    }

    const token = jwt.sign({ _id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET, {
      expiresIn: "24h"
    });

    // 5️⃣ Remove password from response
    const userObj = existingUser.toObject();
    delete userObj.password;

    return res.status(200).json(ApiResponse(200, { userObj, token }, "Signup successful"));
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};
