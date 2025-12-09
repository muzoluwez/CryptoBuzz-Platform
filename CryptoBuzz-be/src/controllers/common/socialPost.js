import * as yup from "yup";
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
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const postsWithUserInfo = posts.map(post => ({
      ...post,
      isLiked: req.user ? post.likes.some(like => like.user._id.toString() === req.user._id.toString()) : false,
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      shareCount: post.shares?.length || 0
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
    const { content, visibility, category } = req.body;

    if (!req.user) {
      return res.status(400).json({ status: false, message: "Id is required" });
    }

    const images = [];
    if (req.files?.images) {
      for (const file of req.files.images) {
        const localPath = path.resolve(process.cwd(), file.path);
        const buffer = fs.readFileSync(localPath);

        const url = await uploadImageToAzure(buffer, file.originalname);
        images.push({ url });

        fs.unlinkSync(localPath);
      }
    }

    const videos = [];
    if (req.files?.videos) {
      for (const file of req.files.videos) {
        const localPath = path.resolve(process.cwd(), file.path);
        const buffer = fs.readFileSync(localPath);

        const url = await uploadVideoToAzure(buffer, file.originalname);
        videos.push({ url });

        fs.unlinkSync(localPath);
      }
    }

    const post = new PostModel({
      author: req.user._id,
      content,
      images,
      videos,
      category: category || "General Updates",
      visibility: visibility || "public"
    });

    await post.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    await post.populate("author", "first_name last_name image bio role category");

    // await notifyFollowersOfEducator(
    //   req.user._id,
    //   "📢 New Post on Social Feed",
    //   `${post.author.first_name} ${post.author.last_name} posted: ${content.slice(0, 50)}...`,
    //   { postId: post._id.toString(), screen: "IQSocialFeeds" }
    // );
    return res.status(200).json(ApiResponse(200, post, "Post created successfully"));
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
    const { content, visibility, category } = req.body;

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (content) post.content = content;
    if (visibility) post.visibility = visibility;
    if (category) post.category = category;

    // Replace images
    if (req.files?.images) {
      for (const img of post.images) {
        if (img.url) await deleteImageFromAzure(img.url).catch(() => {});
      }

      const newImages = [];
      for (const file of req.files.images) {
        const localPath = path.resolve(process.cwd(), file.path);
        const buffer = fs.readFileSync(localPath);
        const url = await uploadImageToAzure(buffer, file.originalname);
        newImages.push({ url });
        fs.unlinkSync(localPath);
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
        const localPath = path.resolve(process.cwd(), file.path);
        const buffer = fs.readFileSync(localPath);
        const url = await uploadVideoToAzure(buffer, file.originalname);
        newVideos.push({ url });
        fs.unlinkSync(localPath);
      }

      post.videos = newVideos;
    }

    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate("author", "first_name last_name image bio role category");
    return res.status(200).json(ApiResponse(200, post, "Post updated successfully"));
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
