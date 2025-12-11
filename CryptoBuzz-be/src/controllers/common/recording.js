import axios from "axios";
import recordingModel from "../../models/recording.js"
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
  deleteImageFromAzure,
} from "../../utils/azureUploader.js";


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
      call_tags,
    } = req.body;

    const session = await Schedule.findOne({
      educator: educator_id,
      callId: call_id,
    })
      .populate("educator", "first_name last_name projectId")
      .populate("category", "name");

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    const educator_name = `${session.educator?.first_name || ""} ${session.educator?.last_name || ""}`.trim();
    const category_name = session.category?.name || call_category || "General";
    const language = session.language || "English";

    const projectId = session.educator?.projectId || "IcryHgzSpkys2tRtl3M8FQ";

    const exists = await recordingModel.findOne({
      streamio_filename: filename,
    });

    if (exists)
      return res.status(400).json({ message: "Recording already exist" });

    if (!url)
      return res.status(400).json({ message: "url is required" });

    if (!DYNTUBE_API_KEY)
      return res.status(400).json({ message: "DYNTUBE_API_KEY missing" });

    const formData = new FormData();
    formData.append("url", url);
    formData.append("title", `${category_name}/${call_title}`);
    formData.append("description", call_description || "Uploaded from backend");
    formData.append("projectId", projectId);
    formData.append("tags", educator_name);
    formData.append("tags", category_name);
    formData.append("tags", language);

    if (Array.isArray(call_tags)) {
      call_tags.forEach((t) => formData.append("tags", t));
    } else if (call_tags) {
      formData.append("tags", call_tags);
    }

    const dyntubeResponse = await axios.post(DYNTUBE_UPLOAD_URL, formData, {
      headers: {
        Authorization: `Bearer ${DYNTUBE_API_KEY}`,
        ...formData.getHeaders(),
      },
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
      is_temp: false,
    });

    res.status(201).json({
      message: "Permanent Recording uploaded",
      recording: newRecording,
    });
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
      call_tags,
    } = req.body;

    const session = await Schedule.findOne({
      educator: educator_id,
      callId: call_id,
    })
      .populate("educator", "first_name last_name projectId")
      .populate("category", "name");

    if (!session) return res.status(404).json({ message: "Session not found" });

    const educator_name = `${session.educator?.first_name || ""} ${session.educator?.last_name || ""}`.trim();
    const category_name = session.category?.name || call_category || "General";
    const language = session.language || "English";
    const projectId = session.educator?.projectId || "IcryHgzSpkys2tRtl3M8FQ";

    const exists = await recordingModel.findOne({
      streamio_filename: filename,
    });

    if (exists)
      return res.status(400).json({ message: "Recording already exist" });

    if (!url)
      return res.status(400).json({ message: "url is required" });

    const formData = new FormData();
    formData.append("url", url);
    formData.append("title", `${category_name}/${call_title}`);
    formData.append("description", call_description);
    formData.append("projectId", projectId);

    formData.append("tags", educator_name);
    formData.append("tags", category_name);
    formData.append("tags", language);

    if (Array.isArray(call_tags))
      call_tags.forEach((t) => formData.append("tags", t));

    const dyntubeResponse = await axios.post(DYNTUBE_UPLOAD_URL, formData, {
      headers: {
        Authorization: `Bearer ${DYNTUBE_API_KEY}`,
        ...formData.getHeaders(),
      },
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
      is_temp: true,
    });

    res.status(201).json({
      message: "Temporary recording uploaded",
      recording: newRecording,
    });
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

    const recorder = await User.findById(id).select(
      "_id first_name last_name image role email bannerImage"
    );

    if (!recorder)
      return res.status(404).json({ error: "Recorder not found" });

    const query = { educator_id: recorder._id };
    if (call_id) query.call_id = call_id;

    const totalCount = await recordingModel.countDocuments(query);

    const items = await recordingModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    await Promise.all(
      items.map(async (rec) => {
        if (rec.url) {
          const clean = normalizeBlobName(rec.url);
          rec.url = await getSignedUrl(clean);
        }
      })
    );

    res.status(200).json({
      data: {
        recorder,
        recordings: items,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalCount / limitNumber),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const rec = await recordingModel.findById(req.params.id);
    if (!rec) return res.status(404).json({ error: "Recording not found" });
    res.json(rec);
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
      const localPath = path.resolve(__dirname, "../../../", req.file.path);
      const buffer = fs.readFileSync(localPath);
      thumbnailUrl = await uploadImageToAzure(buffer, req.file.originalname);
      fs.unlinkSync(localPath);
    }

    const payload = {
      ...req.body,
      thumbnail: thumbnailUrl,
    };

    const updated = await recordingModel.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({
      success: true,
      message: "Recording updated",
      data: updated,
    });
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
        headers: { Authorization: `Bearer ${DYNTUBE_API_KEY}` },
      });
    } catch (err) {
      console.log("Dyntube delete error:", err.message);
    }

    await recordingModel.deleteOne({ _id: rec._id });

    res.json({ message: "Recording deleted" });
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
      headers: { Range: range },
    });

    res.writeHead(206, {
      "Content-Range": response.headers["content-range"],
      "Accept-Ranges": "bytes",
      "Content-Length": response.headers["content-length"],
      "Content-Type": "video/mp4",
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
    const {
      educator_id,
      videoUrl,
      start_time,
      end_time,
      call_title,
      call_description,
      call_category,
      call_tags,
    } = req.body;

    const videoFile = req.files?.video?.[0];

    let finalVideoUrl = videoUrl;

    if (!videoUrl && videoFile) {
      const filePath = path.resolve(__dirname, "../../../", videoFile.path);
      const buffer = fs.readFileSync(filePath);

      finalVideoUrl = await uploadVideoToAzure(
        buffer,
        videoFile.originalname,
        "video/mp4"
      );

      fs.unlinkSync(filePath);
    }

    if (!finalVideoUrl)
      return res.status(400).json({ message: "Video file or URL required" });

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
      call_tags,
    });

    res.status(201).json({
      message: "Manual recording created",
      recording: newRec,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------------
   CRON JOB TO DELETE OLD TEMP RECORDINGS
---------------------------------------------------------- */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

cron.schedule("0 0 * * *", async () => {
  try {
    const days = 28;
    const cutoff = new Date(Date.now() - days * 86400000);

    const old = await recordingModel.find({
      createdAt: { $lt: cutoff },
      is_temp: true,
    });

    for (const rec of old) {
      try {
        await axios.delete(
          `https://api.dyntube.com/v1/videos/${rec.dyntube_id}`,
          {
            headers: { Authorization: `Bearer ${DYNTUBE_API_KEY}` },
          }
        );

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
