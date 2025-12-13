import axios from "axios";
import recordingModel from "../../models/recording.js";
import path from "path";
import fs from "fs";
import FormData from "form-data";
import User from "../../models/user.js";
import Schedule from "../../models/schedule.js";
import cron from "node-cron";
import crypto from "crypto";

import {
  uploadVideoToAzure,
  uploadImageToAzure,
  getSignedUrl,
  deleteImageFromAzure
} from "../../utils/azureUploader.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// 🛠 Normalize Blob Name
function normalizeBlobName(blobName) {
  try {
    const url = new URL(blobName);
    return url.pathname.split("/").pop();
  } catch {
    return blobName;
  }
}

const DYNTUBE_UPLOAD_URL = "https://upload.dyntube.com/v1/videos";
const DYNTUBE_API_KEY = process.env.DYNTUBE_API_KEY;

/* ---------------------------------------------------------
   CREATE PERMANENT RECORDING
---------------------------------------------------------- */
export const createPermanentRecording = async (req, res) => {
  try {
    const {
      educator_id,
      session_id,
      url,
      filename,
      start_time,
      end_time,
      call_id,
      call_title,
      call_description,
      call_category,
      call_tags
    } = req.body;

    const session = await Schedule.findOne({
      educator: educator_id,
      callId: call_id
    })
      .populate("educator", "first_name last_name projectId")
      .populate("category", "name");

    if (!session) return res.status(404).json({ message: "Session not found" });

    const educator_name = `${session.educator?.first_name || ""} ${session.educator?.last_name || ""}`.trim();
    const category_name = session.category?.name || call_category || "General";
    const language = session.language || "English";

    const projectId = session.educator?.projectId || "IcryHgzSpkys2tRtl3M8FQ";

    const exists = await recordingModel.findOne({
      streamio_filename: filename
    });

    if (exists) return res.status(400).json({ message: "Recording already exist" });

    if (!url) return res.status(400).json({ message: "url is required" });

    if (!DYNTUBE_API_KEY) return res.status(400).json({ message: "DYNTUBE_API_KEY missing" });

    const formData = new FormData();
    formData.append("url", url);
    formData.append("title", `${category_name}/${call_title}`);
    formData.append("description", call_description || "Uploaded from backend");
    formData.append("projectId", projectId);
    formData.append("tags", educator_name);
    formData.append("tags", category_name);
    formData.append("tags", language);

    if (Array.isArray(call_tags)) {
      call_tags.forEach(t => formData.append("tags", t));
    } else if (call_tags) {
      formData.append("tags", call_tags);
    }

    const dyntubeResponse = await axios.post(DYNTUBE_UPLOAD_URL, formData, {
      headers: {
        Authorization: `Bearer ${DYNTUBE_API_KEY}`,
        ...formData.getHeaders()
      }
    });

    const data = dyntubeResponse.data;

    const newRecording = await recordingModel.create({
      educator_id,
      session_id,
      filename,
      streamio_filename: filename,
      videoUrl: `https://videos.dyntube.com/iframes/${data?.iframeLink}`,
      dyntube_id: data?.videoId,
      dyntubeVideoKey: data?.videoKey,
      start_time,
      end_time,
      call_id,
      call_title,
      call_description,
      call_category,
      call_tags,
      educator_name,
      category_name,
      language,
      is_temp: false
    });
    return res.status(200).json(ApiResponse(200, newRecording, "Permanent Recording uploaded"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------------
   CREATE TEMPORARY RECORDING
---------------------------------------------------------- */
export const createTemporaryRecording = async (req, res) => {
  try {
    const {
      educator_id,
      session_id,
      url,
      filename,
      start_time,
      end_time,
      call_id,
      call_title,
      call_description,
      call_category,
      call_tags
    } = req.body;

    const session = await Schedule.findOne({
      educator: educator_id,
      callId: call_id
    })
      .populate("educator", "first_name last_name projectId")
      .populate("category", "name");

    if (!session) return res.status(404).json({ message: "Session not found" });

    const educator_name = `${session.educator?.first_name || ""} ${session.educator?.last_name || ""}`.trim();
    const category_name = session.category?.name || call_category || "General";
    const language = session.language || "English";
    const projectId = session.educator?.projectId || "IcryHgzSpkys2tRtl3M8FQ";

    const exists = await recordingModel.findOne({
      streamio_filename: filename
    });

    if (exists) return res.status(400).json({ message: "Recording already exist" });

    if (!url) return res.status(400).json({ message: "url is required" });

    const formData = new FormData();
    formData.append("url", url);
    formData.append("title", `${category_name}/${call_title}`);
    formData.append("description", call_description);
    formData.append("projectId", projectId);

    formData.append("tags", educator_name);
    formData.append("tags", category_name);
    formData.append("tags", language);

    if (Array.isArray(call_tags)) call_tags.forEach(t => formData.append("tags", t));

    const dyntubeResponse = await axios.post(DYNTUBE_UPLOAD_URL, formData, {
      headers: {
        Authorization: `Bearer ${DYNTUBE_API_KEY}`,
        ...formData.getHeaders()
      }
    });

    const data = dyntubeResponse.data;

    const newRecording = await recordingModel.create({
      educator_id,
      session_id,
      filename,
      streamio_filename: filename,
      videoUrl: `https://videos.dyntube.com/iframes/${data?.iframeLink}`,
      dyntube_id: data?.videoId,
      dyntubeVideoKey: data?.videoKey,
      start_time,
      end_time,
      call_id,
      call_title,
      call_description,
      call_category,
      call_tags,
      educator_name,
      category_name,
      language,
      is_temp: true
    });

    return res.status(200).json(ApiResponse(200, newRecording, "Temporary recording uploaded"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------------------
   GET RECORDINGS
---------------------------------------------------------- */
export const getRecordings = async (req, res) => {
  try {
    const { id } = req.user;
    const { call_id, page = 1, limit = 9 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const recorder = await User.findById(id).select("_id first_name last_name image role email bannerImage");

    if (!recorder) return res.status(404).json({ error: "Recorder not found" });

    const query = {};
    if (recorder.role === "educator") {
      query.educator_id = recorder._id;
    }
    if (call_id) query.call_id = call_id;

    const totalCount = await recordingModel.countDocuments(query);

    const items = await recordingModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    console.log(items, "items");

    await Promise.all(
      items.map(async rec => {
        if (rec.url) {
          const clean = normalizeBlobName(rec.url);
          rec.url = await getSignedUrl(clean);
        }
      })
    );

    const pagination = {
      total: totalCount,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(totalCount / limitNumber)
    };

    return res
      .status(200)
      .json(GetApiResponse(200, { recorder, recordings: items }, pagination, "fetch recording successfully"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminRecordings = async (req, res) => {
  try {
    const { user_id, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Get distinct educator IDs from recordings
    let recorderIds = await recordingModel.distinct("educator_id");

    // If a user_id is provided, filter only that ID (if it exists in the list)
    if (user_id) {
      if (!recorderIds.includes(user_id)) {
        return res.status(200).json({ data: [] }); // No recordings for this user
      }
      recorderIds = [user_id];
    }

    // Fetch all users (admin + educator) who have recordings
    const recorders = await User.find({ _id: { $in: recorderIds } }).select(
      "_id first_name last_name image role email bannerImage"
    );

    const result = [];

    for (const recorder of recorders) {
      // Count total recordings for pagination
      const totalRecordings = await recordingModel.countDocuments({
        educator_id: recorder._id
      });

      // Paginate recordings for this educator
      const userRecordings = await recordingModel
        .find({ educator_id: recorder._id })
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

      // Generate signed URLs for Azure videos
      for (let rec of userRecordings) {
        if (rec.url) {
          const cleanName = normalizeBlobName(rec.url);
          rec.url = await getSignedUrl(cleanName);
        }
      }

      result.push({
        recorder: {
          id: recorder._id,
          first_name: recorder.first_name || "",
          last_name: recorder.last_name || "",
          full_name: `${recorder.first_name || ""} ${recorder.last_name || ""}`.trim(),
          total_recording: totalRecordings,
          image: recorder.image || null,
          role: recorder.role || "educator",
          email: recorder.email || null,
          bannerImage: recorder.bannerImage || null
        },
        // recordings: userRecordings.map(item => ({
        //   _id: item._id,
        //   session_id: item.session_id,
        //   url: item.url ? item.url : item.videoUrl ? item.videoUrl : null,
        //   stream_url: item?.stream_url,
        //   start_time: item.start_time,
        //   end_time: item.end_time,
        //   thumbnail: item?.thumbnail,
        //   call_id: item.call_id,
        //   call_title: item.call_title,
        //   call_description: item.call_description,
        //   call_category: item.call_category,
        //   call_tags: item.call_tags,
        //   createdAt: item.createdAt,
        //   updatedAt: item.updatedAt
        // })),
        pagination: {
          total: totalRecordings,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalRecordings / limitNumber)
        }
      });
    }

    return res.status(200).json({ data: result });
  } catch (err) {
    console.error("Error in getRecordings:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------------------
   SECURE DYNTUBE URL
---------------------------------------------------------- */
export const secureUrl = (req, res) => {
  const securityKey = process.env.DYNTUBE_API_KEY;
  const videoKey = req.params.videoKey;

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 1);

  const expiryTime = Math.floor(expiryDate.getTime() / 1000);

  let tokenInput = securityKey + expiryTime + videoKey;
  let token = crypto
    .createHash("sha256")
    .update(tokenInput)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const secureUrl = `https://api.dyntube.com/v1/live/videos/tokens/${videoKey}.m3u8?token=${token}&expires=${expiryTime}`;

  res.json({ url: secureUrl });
};

/* ---------------------------------------------------------
   GET SINGLE RECORDING
---------------------------------------------------------- */

export const getRecordingById = async (req, res) => {
  try {
    const recording = await recordingModel.find({ educator_id: req.params.id });
    if (!recording) return res.status(404).json({ error: "Recording not found" });

    const recordings = recording.map(item => ({
      _id: item._id,
      session_id: item.session_id,
      url: item.url ? item.url : item.videoUrl ? item.videoUrl : null,
      stream_url: item?.stream_url,
      start_time: item.start_time,
      end_time: item.end_time,
      thumbnail: item?.thumbnail,
      call_id: item.call_id,
      call_title: item.call_title,
      call_description: item.call_description,
      call_category: item.call_category,
      call_tags: item.call_tags,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
    return res.status(200).json(ApiResponse(200, recordings, "Recording educator successfully"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* ---------------------------------------------------------
   UPDATE RECORDING
---------------------------------------------------------- */
export const updateRecording = async (req, res) => {
  try {
    let thumbnailUrl = null;

    if (req.file) {
      thumbnailUrl = await uploadImageToAzure(req.file.buffer, req.file.originalname);
    }

    const payload = {
      ...req.body,
      thumbnail: thumbnailUrl
    };

    const updated = await recordingModel.findByIdAndUpdate(req.params.id, payload, { new: true });

    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    return res.status(200).json(ApiResponse(200, updated, "Recording updated successfully"));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ---------------------------------------------------------
   DELETE RECORDING
---------------------------------------------------------- */
export const deleteRecording = async (req, res) => {
  try {
    const rec = await recordingModel.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: "Recording not found" });

    if (rec.thumbnail) deleteImageFromAzure(rec.thumbnail);

    try {
      await axios.delete(`https://api.dyntube.com/v1/videos/${rec.dyntube_id}`, {
        headers: { Authorization: `Bearer ${DYNTUBE_API_KEY}` }
      });
    } catch (err) {
      console.log("Dyntube delete error:", err.message);
    }

    await recordingModel.deleteOne({ _id: rec._id });
    return res.status(200).json(ApiResponse(200, {}, "Recording delete successfully"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------------------
   STREAM VIDEO (Proxy)
---------------------------------------------------------- */
export const streamVideo = async (req, res) => {
  try {
    const range = req.headers.range;
    if (!range) return res.status(400).send("Range header required");

    const rec = await recordingModel.findById(req.params.id);
    if (!rec) return res.status(404).send("Recording not found");

    const blobUrl = rec.url;

    const response = await axios.get(blobUrl, {
      responseType: "stream",
      headers: { Range: range }
    });

    res.writeHead(206, {
      "Content-Range": response.headers["content-range"],
      "Accept-Ranges": "bytes",
      "Content-Length": response.headers["content-length"],
      "Content-Type": "video/mp4"
    });

    response.data.pipe(res);
  } catch (err) {
    res.status(500).send("Error streaming video");
  }
};

/* ---------------------------------------------------------
   MANUAL RECORDING
---------------------------------------------------------- */
export const createManuallyRecording = async (req, res) => {
  try {
    const { educator_id, videoUrl, start_time, end_time, call_title, call_description, call_category, call_tags } =
      req.body;

    const videoFile = req.files?.video?.[0];

    let finalVideoUrl = videoUrl;

    if (!videoUrl && videoFile) {
      finalVideoUrl = await uploadVideoToAzure(videoFile.buffer, videoFile.originalname, "video/mp4");
    }

    if (!finalVideoUrl) return res.status(400).json({ message: "Video file or URL required" });

    const newRec = await recordingModel.create({
      educator_id,
      session_id: "manual-session",
      videoUrl,
      url: finalVideoUrl,
      start_time,
      end_time,
      call_id: "manual-call",
      call_title,
      call_description,
      call_category,
      call_tags
    });
    return res.status(200).json(ApiResponse(200, newRec, "Manual recording created"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------------
   CRON JOB TO DELETE OLD TEMP RECORDINGS
---------------------------------------------------------- */
const delay = ms => new Promise(r => setTimeout(r, ms));

cron.schedule("0 0 * * *", async () => {
  try {
    const days = 28;
    const cutoff = new Date(Date.now() - days * 86400000);

    const old = await recordingModel.find({
      createdAt: { $lt: cutoff },
      is_temp: true
    });

    for (const rec of old) {
      try {
        await axios.delete(`https://api.dyntube.com/v1/videos/${rec.dyntube_id}`, {
          headers: { Authorization: `Bearer ${DYNTUBE_API_KEY}` }
        });

        await recordingModel.deleteOne({ _id: rec._id });
      } catch (err) {
        console.log("Cron delete error:", err.message);
      }

      await delay(1100); // respect rate limit
    }
  } catch (err) {
    console.log("Cron error:", err.message);
  }
});
