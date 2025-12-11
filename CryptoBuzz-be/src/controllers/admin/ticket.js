import TicketModel from "../../models/ticket.js";
import User from "../../models/user.js";
import * as yup from "yup";
import path from "path";
import fs from "fs";

import {
  uploadVideoToAzure,
  uploadImageToAzure,
  deleteImageFromAzure,
  deleteVideoFromAzure
} from "../../utils/azureUploader.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

const postValidationSchema = yup.object().shape({
  title: yup
    .string()
    .required("Ticket title is required")
    .max(100, "Ticket title cannot exceed 1500 characters")
    .trim(),

  description: yup
    .string()
    .required("Ticket description is required")
    .max(1500, "Ticket description cannot exceed 1500 characters")
    .trim(),

  priority: yup.string().oneOf(["low", "medium", "high"], "Invalid category").default("low")
});

/* ---------------------- GET TICKETS ---------------------- */
export const getTickets = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;

    let author;
    if (req.user.role === "admin" || req.user.role === "superAdmin") {
      author = req.user.id;
    }

    const query = {};
    if (author) query.author = author;

    const tickets = await TicketModel.find(query)
      .populate("author", "first_name last_name image bio role")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await TicketModel.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    };
    return res.status(200).json(GetApiResponse(200, tickets, pagination, "Schedules updated successfully"));
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({ message: "Server error fetching tickets" });
  }
};

/* ---------------------- CREATE TICKET ---------------------- */
export const createTicket = async (req, res) => {
  try {
    await postValidationSchema.validate(req.body, { abortEarly: false });
    const { title, description, priority } = req.body;

    if (!req.user) {
      return res.status(400).json({ status: false, message: "Id is required.." });
    }

    const images = [];
    if (req.files?.images) {
      for (const file of req.files.images) {
        const localPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../", file.path);
        const buffer = fs.readFileSync(localPath);
        const azureUrl = await uploadImageToAzure(buffer, file.originalname);
        images.push({ url: azureUrl });
        fs.unlinkSync(localPath);
      }
    }

    const videos = [];
    if (req.files?.videos) {
      for (const file of req.files.videos) {
        const localPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../", file.path);
        const buffer = fs.readFileSync(localPath);
        const azureUrl = await uploadVideoToAzure(buffer, file.originalname);
        videos.push({ url: azureUrl });
        fs.unlinkSync(localPath);
      }
    }

    const ticket = new TicketModel({
      author: req.user._id,
      title,
      description,
      priority: priority || "low",
      images,
      videos
    });

    await ticket.save();
    return res.status(200).json(ApiResponse(200, ticket, "Ticket created successfully"));
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ message: "Server error creating ticket" });
  }
};

/* ---------------------- UPDATE TICKET ---------------------- */
export const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    await postValidationSchema.validate(req.body, { abortEarly: false });

    const { title, description, priority } = req.body;

    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ status: false, message: "Ticket not found" });
    }

    if (ticket.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: false, message: "Not authorized to update this post" });
    }

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (priority) ticket.priority = priority;

    // IMAGE UPDATE
    if (req.files?.images?.length > 0) {
      for (const img of ticket.images) {
        if (img.url) await deleteImageFromAzure(img.url).catch(console.error);
      }

      const newImages = [];
      for (const file of req.files.images) {
        const localPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../", file.path);
        const buffer = fs.readFileSync(localPath);
        const azureUrl = await uploadImageToAzure(buffer, file.originalname);
        newImages.push({ url: azureUrl });
        fs.unlinkSync(localPath);
      }
      ticket.images = newImages;
    }

    // VIDEO UPDATE
    if (req.files?.videos?.length > 0) {
      for (const vid of ticket.videos) {
        if (vid.url) await deleteVideoFromAzure(vid.url).catch(console.error);
      }

      const newVideos = [];
      for (const file of req.files.videos) {
        const localPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../", file.path);
        const buffer = fs.readFileSync(localPath);
        const azureUrl = await uploadVideoToAzure(buffer, file.originalname);
        newVideos.push({ url: azureUrl });
        fs.unlinkSync(localPath);
      }
      ticket.videos = newVideos;
    }

    ticket.isEdited = true;
    ticket.editedAt = new Date();

    await ticket.save();
    await ticket.populate("author", "first_name last_name image bio role category");
    return res.status(200).json(ApiResponse(200, ticket, "Ticket updated successfully"));
  } catch (error) {
    console.error("Update ticket error:", error);
    res.status(500).json({ message: "Server error updating ticket" });
  }
};

/* ---------------------- DELETE TICKET ---------------------- */
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await TicketModel.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    for (const img of ticket.images) {
      if (img.url) await deleteImageFromAzure(img.url).catch(console.error);
    }

    for (const vid of ticket.videos) {
      if (vid.url) await deleteVideoFromAzure(vid.url).catch(console.error);
    }

    await TicketModel.findByIdAndDelete(req.params.id);
    return res.status(200).json(ApiResponse(200, {}, "Ticket deleted successfully"));
  } catch (error) {
    console.error("Delete ticket error:", error);
    res.status(500).json({ message: "Server error deleting ticket" });
  }
};

/* ---------------------- EXPORT DEFAULT ---------------------- */
export default {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket
};
