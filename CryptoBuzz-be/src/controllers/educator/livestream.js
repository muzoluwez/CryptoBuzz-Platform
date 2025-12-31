import LiveStreamModel from "../../models/liveStream.js";
import Schedule from "../../models/schedule.js";
import User from "../../models/user.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import RecurrenceSchedule from "../../models/recurrenceSchedule.js";
import { createLiveStreamForSchedule } from "../common/stream.js";
import { streamClient } from "../../utils/constants.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// ✔ Find admin user
async function getAdminUser() {
  try {
    const admin = await User.findOne({ role: "admin" });
    return admin || null;
  } catch (err) {
    console.error("Error:", err);
  }
}

// ✔ Fetch Stream calls
async function getAllCalls(streamClient, educatorId) {
  let allCalls = [];
  let next;
  const admin = await getAdminUser();

  try {
    do {
      const response = await streamClient.video.queryCalls({
        created_by_user_id: { $in: [educatorId, admin._id] },
        sort: [{ field: "created_at", direction: -1 }],
        limit: 100,
        ...(next ? { next } : {})
      });

      allCalls.push(...response.calls);
      next = response.next;
    } while (next);

    return allCalls;
  } catch (err) {
    console.error("❌ Error fetching calls:", err.message);
    throw new Error("Failed to fetch calls from Stream API");
  }
}

export const getLiveDetails = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(400).json({ message: "User not found" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "pending";
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const baseFilter = {};

    if (user.role === "educator") {
      baseFilter.educator = user._id;
    }

    if (status === "ended") baseFilter.status = "ended";
    else baseFilter.status = { $in: ["pending", "active"] };

    if (search) {
      baseFilter.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    // Parallel DB calls
    const [totalCount, existingData] = await Promise.all([
      LiveStreamModel.countDocuments(baseFilter),
      LiveStreamModel.find(baseFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("educator")
        .populate("schedule", "isRecurent recurrenceRuleId")
    ]);

    let finalData = existingData;

    // Add recurrence check
    if (status !== "ended") {
      finalData = await Promise.all(
        existingData.map(async item => {
          if (!item.schedule?._id) {
            return { ...item.toObject(), checkLastRecurrence: false };
          }

          let checkLastRecurrence = false;
          const recurrence = await RecurrenceSchedule.findOne({
            recurrenceRuleId: item.schedule.recurrenceRuleId
          }).sort({ createdAt: -1 });

          if (recurrence && Date.now() > new Date(recurrence.datetime)) {
            checkLastRecurrence = true;
          }

          return { ...item.toObject(), checkLastRecurrence };
        })
      );
    }

    const pagination = {
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      currentRecords: existingData.length,
      totalRecords: totalCount
    };

    return res.status(200).json(GetApiResponse(200, finalData, pagination, "Records fetched successfully"));
  } catch (error) {
    console.error("❌ getLiveDetails Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
};

export const startCall = async (req, res) => {
  try {
    const { Id, callId } = req.body;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(Id)) return res.status(400).json({ message: "Invalid Id format" });

    if (!Id || !callId) return res.status(400).send("Both Id and callId are required");

    // Only 1 session can be active with isLive true
    const activeSession = await LiveStreamModel.findOne({
      educator: user._id,
      isLive: true
    });

    if (activeSession) {
      return res.status(400).json({
        success: false,
        message: "Another session is active. End it first."
      });
    }

    const updatedSchedule = await LiveStreamModel.findOneAndUpdate(
      { _id: Id, callId },
      { status: "active", isLive: false }, // Don't set isLive true here, it will be set when Go Live is clicked
      { new: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }
    return res.status(200).json(ApiResponse(200, updatedSchedule, "Live session started"));
  } catch (error) {
    console.error("Error in startCall:", error);
    res.status(500).send("Error starting call");
  }
};

// ✔ Create livestream
export const createLive = async (schedule, createdUser) => {
  try {
    const callId = schedule.callId || `callId-${uuidv4()}`;

    const call = streamClient.video.call("livestream", callId);

    const educator = createdUser._id;

    // Create livestream on Stream
    const response = await call.getOrCreate({
      data: {
        created_by_id: educator,
        members: [{ user_id: educator, role: "admin" }],
        settings_override: {
          broadcast: {
            hls: { enabled: true, auto_start: true }
          },
          recording: {
            mode: "available",
            audio_only: false,
            quality: "1080p",
            layout: {
              name: "single-participant",
              options: {
                "layout.background_color": "#000",
                "participant.aspect_ratio": "16/9"
              }
            }
          }
        },
        custom: {
          title: schedule.title,
          description: schedule.description,
          category: schedule.category,
          tags: schedule.tags
        }
      }
    });

    const rtmp_URl = response.call?.ingress?.rtmp?.address || null;

    const token = streamClient.generateUserToken({
      user_id: schedule.educator,
      validity_in_seconds: 31536000,
      video: {
        livestream: ["JoinCall", "CreateCall", "StartRecording", "StopRecording"]
      }
    });

    await LiveStreamModel.create({
      title: schedule.title,
      datetime: schedule.datetime,
      educator: schedule.educator,
      callId,
      token,
      rtmp_URl
    });

    schedule.generateToken = true;
    schedule.callId = callId;
    schedule.status = "pending";
    await schedule.save();

    return {
      success: true,
      message: "Live stream created"
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const createLiveStreamOnTime = async (req, res) => {
  try {
    const createdUser = req.user;

    const scheduleData = {
      ...req.body,
      callId: `callId-${uuidv4()}`,
      tags: Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(",").map(tag => tag.trim()),
      datetime: new Date(),
      educator: createdUser._id
    };

    const schedule = new Schedule(scheduleData);
    await schedule.save();

    const result = await createLive(schedule, createdUser);

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate("category", "name")
      .populate("educator", "first_name last_name image")
      .populate("language", "name");

    res.status(201).json({
      success: true,
      data: populatedSchedule,
      stream: result,
      message: "Schedule created successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Stop livestream
export const stopLiveStream = async (req, res) => {
  const { callId } = req.body;

  if (!callId) return res.status(400).send("Call ID is required");

  try {
    const findSchedule = await Schedule.findOne({ callId });
    const findLiveStream = await LiveStreamModel.findOne({ callId });

    if (!findLiveStream) return res.status(404).json({ message: "Live session not found" });

    // Set isLive to false and status to ended
    findLiveStream.isLive = false;
    findLiveStream.status = "ended";
    await findLiveStream.save();

    if (findSchedule) {
      findSchedule.status = "ended";
      await findSchedule.save();
    }

    const call = streamClient.video.call("livestream", callId);
    await call.stopLive();
    await call.end();
    return res.status(200).json(ApiResponse(200, {}, "Live stream ended successfully"));
  } catch (error) {
    res.status(500).send("Error stopping livestream");
  }
};

// Update schedule status
export const updateLiveStreamStatus = async (req, res) => {
  const { callId } = req.params;
  const { status } = req.body;

  if (!callId) return res.status(400).send("Call ID is required");

  try {
    const schedule = await Schedule.findOne({ callId });
    const liveStream = await LiveStreamModel.findOne({ callId });

    if (schedule) {
      schedule.status = status;
      await schedule.save();
    }

    // Update isLive based on status
    if (liveStream) {
      if (status === "active") {
        liveStream.isLive = true;
        liveStream.status = "active";
      } else if (status === "pending") {
        liveStream.isLive = false;
        liveStream.status = "pending";
      }
      await liveStream.save();
    }

    res.status(200).json({
      success: true,
      data: schedule,
      message: "Status updated"
    });
  } catch (error) {
    res.status(500).send("Error updating livestream status");
  }
};

// Change status inside LiveStream collection
export const changeLiveStreamStatus = async (req, res) => {
  const { callId } = req.params;
  const { status } = req.body;

  if (!callId || status !== "ended") return res.status(400).send("Invalid request");

  try {
    const stream = await LiveStreamModel.findOne({ callId });

    if (!stream) return res.status(404).json({ message: "Not found" });

    // Set isLive to false and status to ended
    stream.isLive = false;
    stream.status = "ended";
    await stream.save();

    res.status(200).json({
      success: true,
      data: stream,
      message: "Status updated"
    });
  } catch (error) {
    res.status(500).send("Error updating livestream status");
  }
};

// Retry helper
async function retryAsync(fn, retries = 3, delay = 1000) {
  let lastError;
  for (let i = 1; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries) await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// End & auto-create next
export const endAndCreate = async (req, res) => {
  const { callId } = req.body;

  if (!callId) return res.status(400).send("Call ID is required");

  try {
    const findSchedule = await Schedule.findOne({ callId });
    const findLiveStream = await LiveStreamModel.findOne({ callId });

    if (!findLiveStream) return res.status(400).json({ message: "Invalid callId" });

    // Set isLive to false and status to ended
    findLiveStream.isLive = false;
    findLiveStream.status = "ended";
    await findLiveStream.save();

    if (findSchedule) {
      findSchedule.status = "ended";
      await findSchedule.save();
    }

    const call = streamClient.video.call("livestream", callId);

    await retryAsync(() => call.stopLive());
    await retryAsync(() => call.end());

    if (findSchedule) {
      const scheduleData = {
        ...findSchedule.toObject(),
        _id: undefined,
        callId: `callId-${uuidv4()}`,
        status: "pending"
      };

      delete scheduleData.createdAt;
      delete scheduleData.updatedAt;

      const schedule = new Schedule(scheduleData);
      await schedule.save();

      await createLiveStreamForSchedule(schedule);
    }
    return res.status(200).json(ApiResponse(200, {}, "Ended and recreated successfully"));
  } catch (error) {
    res.status(500).send("Error processing livestream");
  }
};
