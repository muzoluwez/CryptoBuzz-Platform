import * as yup from "yup";
import mongoose from "mongoose";
import PostModel from "../../models/socialPost.js";
import User from "../../models/user.js";
import path from "path";
import fs from "fs";

import {
  uploadImageToAzure,
  uploadVideoToAzure,
  deleteVideoFromAzure,
  deleteImageFromAzure
} from "../../utils/azureUploader.js";

// import { notifyUsersOnSocialFeed, notifyFollowersOfEducator } from "../../firebase/messaging.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// -------------------------------------------
// GET POSTS
// -------------------------------------------
export const getPosts = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "recent";
    const category = req.query.category;

    let author;
    if (req.user?.role === "educator") {
      author = req.user.id;
    }
    const query = { isArchived: false };

    if (category) query.category = category;
    if (author) query.author = author;

    // Handle visibility
    if (!req.user) {
      query.visibility = "public";
    } else {
      query.$or = [
        { visibility: "public" },
        { author: req.user._id },
        {
          visibility: "followers",
          author: { $in: req.user.following }
        }
      ];
    }

    // Sorting
    let sort = {};
    if (sortBy === "top") sort = { likeCount: -1, createdAt: -1 };
    else sort = { isPinned: -1, createdAt: -1 };

    const posts = await PostModel.find(query)
      .populate("author", "first_name last_name image bio role")
      .populate("likes.user", "username")
      .populate("comments.user", "username avatar")
      .populate("plans", "name price description hotmartCheckoutCode hotmartCheckoutUrl")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const postsWithUserInfo = posts.map(post => ({
      ...post,
      isLiked: req.user ? post.likes.some(like => like.user._id.toString() === req.user._id.toString()) : false,
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      shareCount: post.shares?.length || 0,
      accessType: post.tier || "PUBLIC", // Map tier to accessType for frontend compatibility
      tier: post.tier || "PUBLIC",
      plans: post.plans || []
    }));

    const total = await PostModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const pagination = {
      currentPage: page,
      totalPages,
      totalPosts: total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return res.status(200).json(GetApiResponse(200, postsWithUserInfo, pagination, "Post fetched successfully"));
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error fetching posts" });
  }
};

// -------------------------------------------
// CREATE POST
// -------------------------------------------
export const createPost = async (req, res) => {
  try {
    const { content, visibility, category, accessType } = req.body;

    if (!req.user) {
      return res.status(400).json({ status: false, message: "Id is required" });
    }

    // Handle plans array from FormData (can come as req.body['plans[]'] or req.body.plans)
    let plansArray = [];
    if (req.body['plans[]']) {
      // Multer sends arrays as 'plans[]'
      plansArray = Array.isArray(req.body['plans[]']) 
        ? req.body['plans[]'] 
        : [req.body['plans[]']];
    } else if (req.body.plans) {
      plansArray = Array.isArray(req.body.plans) ? req.body.plans : [req.body.plans];
    }
    
    // Filter and validate plan IDs
    const validPlans = plansArray
      .filter(p => p && p !== "null" && p !== "undefined" && /^[0-9a-fA-F]{24}$/.test(String(p)))
      .map(p => new mongoose.Types.ObjectId(p));

    const images = [];
    if (req.files?.images) {
      for (const file of req.files.images) {
        const url = await uploadImageToAzure(file.buffer, file.originalname);
        images.push({ url });
      }
    }

    const videos = [];
    if (req.files?.videos) {
      for (const file of req.files.videos) {
        const url = await uploadVideoToAzure(file.buffer, file.originalname);
        videos.push({ url });
      }
    }

    const post = new PostModel({
      author: req.user._id,
      content,
      images,
      videos,
      category: category || "General Updates",
      visibility: visibility || "public",
      tier: accessType || "PUBLIC", // Map accessType to tier
      // Only add plans if PRO tier and valid plans exist
      plans: (accessType === "PRO" && validPlans.length > 0) ? validPlans : []
    });

    await post.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    // Populate fields separately since chaining may not work
    await post.populate("author", "first_name last_name image bio role category");
    await post.populate("plans", "name price description hotmartCheckoutCode hotmartCheckoutUrl");

    // Map tier back to accessType for frontend compatibility
    const postResponse = post.toObject();
    postResponse.accessType = postResponse.tier || "PUBLIC";

    // await notifyFollowersOfEducator(
    //   req.user._id,
    //   "📢 New Post on Social Feed",
    //   `${post.author.first_name} ${post.author.last_name} posted: ${content.slice(0, 50)}...`,
    //   { postId: post._id.toString(), screen: "IQSocialFeeds" }
    // );
    return res.status(200).json(ApiResponse(200, postResponse, "Post created successfully"));
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error creating post" });
  }
};

// -------------------------------------------
// UPDATE POST
// -------------------------------------------
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, visibility, category, accessType } = req.body;

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Handle plans array from FormData (can come as req.body['plans[]'] or req.body.plans)
    let plansArray = [];
    if (req.body['plans[]']) {
      plansArray = Array.isArray(req.body['plans[]']) 
        ? req.body['plans[]'] 
        : [req.body['plans[]']];
    } else if (req.body.plans) {
      plansArray = Array.isArray(req.body.plans) ? req.body.plans : [req.body.plans];
    }
    
    // Filter and validate plan IDs
    const validPlans = plansArray
      .filter(p => p && p !== "null" && p !== "undefined" && /^[0-9a-fA-F]{24}$/.test(String(p)))
      .map(p => new mongoose.Types.ObjectId(p));

    if (content) post.content = content;
    if (visibility) post.visibility = visibility;
    if (category) post.category = category;
    if (accessType) post.tier = accessType; // Map accessType to tier
    
    // Update plans: only set if PRO tier, otherwise clear
    if (accessType === "PRO" && validPlans.length > 0) {
      post.plans = validPlans;
    } else if (accessType !== "PRO") {
      post.plans = [];
    }

    // Replace images
    if (req.files?.images) {
      for (const img of post.images) {
        if (img.url) await deleteImageFromAzure(img.url).catch(() => {});
      }

      const newImages = [];
      for (const file of req.files.images) {
        const url = await uploadImageToAzure(file.buffer, file.originalname);
        newImages.push({ url });
      }

      post.images = newImages;
    }

    // Replace videos
    if (req.files?.videos) {
      for (const vid of post.videos) {
        if (vid.url) await deleteVideoFromAzure(vid.url).catch(() => {});
      }

      const newVideos = [];
      for (const file of req.files.videos) {
        const url = await uploadVideoToAzure(file.buffer, file.originalname);
        newVideos.push({ url });
      }

      post.videos = newVideos;
    }

    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    
    // Populate fields separately since chaining may not work
    await post.populate("author", "first_name last_name image bio role category");
    await post.populate("plans", "name price description hotmartCheckoutCode hotmartCheckoutUrl");
    
    // Map tier back to accessType for frontend compatibility
    const postResponse = post.toObject();
    postResponse.accessType = postResponse.tier || "PUBLIC";
    
    return res.status(200).json(ApiResponse(200, postResponse, "Post updated successfully"));
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error updating post" });
  }
};

// -------------------------------------------
// DELETE POST
// -------------------------------------------
export const deletePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "educator") {
      return res.status(403).json({ message: "Access denied" });
    }

    for (const img of post.images) {
      if (img.url) await deleteImageFromAzure(img.url).catch(() => {});
    }

    for (const vid of post.videos) {
      if (vid.url) await deleteVideoFromAzure(vid.url).catch(() => {});
    }

    await PostModel.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } });
    return res.status(200).json(ApiResponse(200, {}, "Post deleted successfully"));
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error deleting post" });
  }
};
