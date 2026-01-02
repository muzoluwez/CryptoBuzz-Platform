import UserModel from "../../models/user.js";
import yup from "yup";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";
import { RestClientV5 } from "bybit-api";

const loginSchema = yup.object().shape({
  email: yup.string().email().required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters long").required("Password is required"),
  remember: yup.boolean().optional()
});
export const signinUser = async (req, res) => {
  try {
    await loginSchema.validate(req.body);
    const { email, password, remember = false, role="admin" } = req.body;

    const existingUser = await UserModel.findOne({ email: email });
    if (!existingUser) {
      return res.status(400).json({ message: "User not exist for this email" });
    }

    if (role && existingUser.role !== role) {
      return res.status(400).json({ message: `You are not registered as ${role} Please contact to admin.` });
    }

    if (existingUser.status == "false") {
      return res.status(400).json({ message: "You are inactive. Please contact to admin." });
    }

    const isValid = await bcrypt.compare(password, existingUser.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid password..!" });
    }
    const token = jwt.sign({ _id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET, {
      expiresIn: remember ? "30d" : "30d"
    });
    const data = {
      _id: existingUser._id,
      first_name: existingUser.first_name,
      last_name: existingUser.last_name,
      email: existingUser.email,
      image: existingUser.image,
      role: existingUser.role,
      name: existingUser?.name || `${existingUser.first_name} ${existingUser.last_name}`,
      expires_at: new Date(jwt.decode(token).exp * 1000) // convert seconds to milliseconds
    };

    const response = {
      user: data,
      token
    };
    return res.status(200).json(ApiResponse(200, response, "User login successfully"));
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.errors || error.message
    });
  }
};

// export const getAffiliateInfo = async (req, res) => {
//   try {

//     const clientTest = new RestClientV5({
//       testnet: true,
//       key: process.env.BYBIT_KEY,
//       secret: process.env.BYBIT_SECRET,
//     });

//     const response = await clientTest.getAffiliateUserInfo({
//       uid: "531503812",
//     });

//     return res
//       .status(200)
//       .json(ApiResponse(200, response, "Fetch data successfully"));
//   } catch (error) {
//     console.error("BYBIT API ERROR:", error);
//     return res
//       .status(500)
//       .json(ApiResponse(500, null, "Something went wrong"));
//   }
// };

export const getAffiliateInfo = async (req, res) => {
  try {
    const clientTest = new RestClientV5({
      testnet: true,
      key: process.env.BYBIT_KEY,
      secret: process.env.BYBIT_SECRET,
      // timestamp/recv_window issue ke liye yeh add karo
      recvWindow: 20000, // 20s window
      strictParamValidation: false,
    });

    const response = await clientTest.getAffiliateUserInfo({
      uid: "531503812",
    });

    return res
      .status(200)
      .json(ApiResponse(200, response, "Fetch data successfully"));
  } catch (error) {
    console.error("BYBIT API ERROR:", JSON.stringify(error, null, 2));
    return res
      .status(500)
      .json(ApiResponse(500, null, "Something went wrong"));
  }
};

export default { signinUser,getAffiliateInfo };
