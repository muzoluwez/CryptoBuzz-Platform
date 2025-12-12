import UserModel from "../../models/user.js";
import path from "path";
import fs from "fs";
import { uploadImageToAzure, deleteImageFromAzure } from "../../utils/azureUploader.js";
import bcrypt from "bcrypt";
import { ApiResponse } from "../../utils/ApiResponse.js";

// ------------------------- GET PROFILE -------------------------

export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: "token is not verify required..!" });
    }

    const existingUser = await UserModel.findById(req.user._id);

    if (!existingUser) {
      return res.status(400).json({ message: "User not exist..!" });
    }

    const data = {
      _id: existingUser._id,
      first_name: existingUser.first_name,
      last_name: existingUser.last_name,
      email: existingUser.email,
      image: `${existingUser.image}`,
      role: existingUser.role
    };
    return res.status(200).json(ApiResponse(200, data, "Admin profile fetched successfully"));
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.errors || error.message
    });
  }
};

// ------------------------- UPDATE PROFILE -------------------------

export const updateEducatorProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: "Token verification is required...!" });
    }

    const { first_name, last_name, email } = req.body;

    const existingUser = await UserModel.findById(req.user._id);
    if (!existingUser) {
      return res.status(400).json({ message: "Admin not exist" });
    }

    let updateData = {};

    // 📌 If no image uploaded
    if (!req.file) {
      updateData = {
        first_name,
        last_name,
        email,
      };
    } else {
      // 📌 Delete old image from Azure
      if (existingUser.image) {
        await deleteImageFromAzure(existingUser.image);
      }

      const azureUrl = await uploadImageToAzure(req.file.buffer, req.file.originalname);

      updateData = {
        first_name,
        last_name,
        email,
        image: azureUrl,
      };
    }

    const updateProfile = await UserModel.findByIdAndUpdate(existingUser._id, updateData, { new: true });

    const plainProfile = updateProfile.toObject();

    return res.status(200).json(
      ApiResponse(
        200,
        {
          ...plainProfile,
          image: `${updateProfile.image}`
        },
        "Admin profile updated successfully"
      )
    );
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.errors || error.message
    });
  }
};
