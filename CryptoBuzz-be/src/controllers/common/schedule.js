// ======================= IMPORTS (ESM) =======================

import Schedule from "../../models/schedule.js";
import * as yup from "yup";

import mongoose from "mongoose";

import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

import { createLiveStreamForSchedule, updateLiveStreamForSchedule } from "../common/stream.js";

import RecurrenceSchedule from "../../models/recurrenceSchedule.js";
import RecurrenceRule from "../../models/RecurrenceRule.js";
import pkg from "rrule";
const { RRule } = pkg;
import LiveStream from "../../models/liveStream.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// ======================= Validation =======================

const scheduleValidationSchema = yup.object().shape({
  title: yup.string().required("Title is required").max(100),
  description: yup.string().max(500),
  category: yup
    .string()
    .required("Category is required")
    .test("is-objectid", "Invalid category ID", value => {
      return mongoose.Types.ObjectId.isValid(value);
    }),
  educator: yup
    .string()
    .required("Educator is required")
    .test("is-objectid", "Invalid educator ID", value => {
      return mongoose.Types.ObjectId.isValid(value);
    }),
  language: yup.string().required("language is required"),
  tags: yup.array().of(yup.string().max(30)).min(1, "At least one tag is required"),
  datetime: yup.date().required("Date and time is required").min(new Date(), "Schedule date must be in the future")
});

// ======================= LIST SCHEDULE =======================

export const listSchedule = async (req, res) => {
  try {
    const educator = req.user;
    const { page = 1, limit = 10, sort = "-datetime", search = "", category } = req.query;

    const query = { isDeleted: false };

    query.status = req.query.status || "pending";

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    if (educator && educator.role == "educator" ) {
      query.educator = educator._id;
    }

    const totalCount = await Schedule.countDocuments(query);
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    const schedules = await Schedule.find(query)
      .populate("category", "name")
      .populate("educator", "first_name last_name image")
      .populate("create_by", "first_name last_name")
      .populate("language", "name")
      .populate("recurrenceRuleId", "frequency interval byWeekday hasEndLimit occurrences endType endDateTime")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const response = schedules.map(item => ({
      _id: item._id,
      title: item.title,
      image: item.image,
      description: item.description,
      status: item.status,
      category: item.category,
      educator: item.educator,
      language: item.language,
      tags: item.tags,
      datetime: item.datetime,
      generateToken: item.generateToken,
      callId: item.callId,
      create_by: item.create_by,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      isRecurent: item.isRecurent || false,
      recurrenceRuleId: item.recurrenceRuleId || ""
    }));

    const pagination = {
      currentPage: Number(page),
      limit: Number(limit),
      totalPages,
      totalRecords: totalCount
    };
    return res.status(200).json(GetApiResponse(200, response, pagination, "Schedules fetched successfully"));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= CREATE SCHEDULE =======================

export const createSchedule = async (req, res) => {
  try {
    const { body } = req;
    const createdUser = req.user;

    if (!createdUser) {
      return res.status(400).json({
        success: false,
        message: "Create user is required..!"
      });
    }

    // await scheduleValidationSchema.validate(body, { abortEarly: false });

    const scheduleData = {
      ...body,
      callId: `callId-${uuidv4()}`,
      tags: Array.isArray(body.tags) ? body.tags : body.tags.split(",").map(tag => tag.trim()),
      datetime: new Date(body.datetime),
      create_by: createdUser
    };

    const schedule = await Schedule.create(scheduleData);

    const result = await createLiveStreamForSchedule(schedule);

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate("category", "name")
      .populate("educator", "first_name last_name image")
      .populate("language", "name");

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: populatedSchedule,
      stream: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.errors || error.message });
  }
};

// ======================= VIEW SCHEDULE =======================

export const viewSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const schedule = await Schedule.findOne({ _id: id, isDeleted: false })
      .populate("category", "name")
      .populate("educator", "firstName lastName");

    if (!schedule) return res.status(404).json({ success: false, message: "Not found" });
    return res.status(200).json(ApiResponse(200, schedule, "Schedules fetched successfully"));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= UPDATE SCHEDULE =======================

export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    await scheduleValidationSchema.validate(body, { abortEarly: false });

    const schedule = await Schedule.findOne({ _id: id, isDeleted: false });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    const updateData = {
      ...body,
      tags: Array.isArray(body.tags) ? body.tags : body.tags.split(",").map(t => t.trim()),
      datetime: new Date(body.datetime)
    };

    const updated = await Schedule.findByIdAndUpdate(id, updateData, {
      new: true
    })
      .populate("category", "name")
      .populate("language", "name")
      .populate("educator", "first_name last_name image");

    await updateLiveStreamForSchedule(updated);

    await RecurrenceSchedule.updateMany(
      { schedule: updated._id },
      {
        $set: {
          title: updated.title,
          description: updated.description,
          category: updated.category,
          language: updated.language,
          tags: updated.tags,
          datetime: updated.datetime
        }
      }
    );
    return res.status(200).json(ApiResponse(200, updated, "Schedules updated successfully"));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= DELETE SCHEDULE =======================

export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const schedule = await Schedule.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    await LiveStream.deleteMany({ callId: schedule.callId });

    if (schedule.recurrenceRuleId) {
      await RecurrenceRule.deleteMany({ _id: schedule.recurrenceRuleId });
      await RecurrenceSchedule.deleteMany({
        recurrenceRuleId: schedule.recurrenceRuleId
      });
    }
    return res.status(200).json(ApiResponse(200, {}, "Schedule deleted successfully"));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= UPDATE STATUS =======================

export const statusUpdate = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const schedule = await Schedule.findById(userId);
    if (!schedule) return res.status(404).json({ success: false, message: "Not found" });

    schedule.status = status;
    await schedule.save();
    return res.status(200).json(ApiResponse(200, {}, "Schedules updated successfully"));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= RECURRING HELPERS =======================

function generateDatesFromRule(rule) {
  if (!rule.startDate) {
    throw new Error("startDate is required to generate recurrence dates");
  }

  const start = new Date(rule.startDate);
  if (isNaN(start)) throw new Error(`Invalid datetime: ${rule.startDate}`);

  const weekdayMap = {
    MO: RRule.MO,
    TU: RRule.TU,
    WE: RRule.WE,
    TH: RRule.TH,
    FR: RRule.FR,
    SA: RRule.SA,
    SU: RRule.SU
  };

  const interval = Number(rule.interval) || 1;
  const options = {
    freq: RRule[rule.frequency],
    interval,
    dtstart: start
  };

  if (rule.endType === "DATE" && rule.endDate) {
    options.until = new Date(rule.endDate);
  } else if (rule.endType === "OCCURRENCES" && rule.occurrences) {
    options.count = rule.occurrences;
  }

  if (rule.frequency === "WEEKLY") {
    options.byweekday = rule.byWeekday?.map(d => weekdayMap[d]);
  }

  const rrule = new RRule(options);

  return rrule.all().map(d => {
    d.setHours(start.getHours(), start.getMinutes(), 0, 0);

    return d;
  });
}

// ======================= CREATE RECURRING =======================

export const createRecurringSessions = async (req, res) => {
  try {
    const body = req.body;

    // await createRecurringScheduleSchema.validate(body, {
    //   abortEarly: false,
    // });

    const createdUser = req.user;

    const recurrence = body.recurrenceRule || {};
    const frequency = recurrence.frequency || "NONE";
    const startDate = new Date(body.datetime);

    let endDate = null;
    if (frequency !== "NONE") {
      if (recurrence.endType === "DATE") {
        endDate = recurrence.endDateTime
          ? new Date(recurrence.endDateTime)
          : new Date(new Date(startDate).setMonth(startDate.getMonth() + 2));
      } else if (recurrence.endType === "OCCURRENCES") {
      } else {
        endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 2));
      }
    }

    const scheduleData = {
      title: body.title,
      category: body.category,
      description: body.description,
      language: body.language,
      educator: body.educator || createdUser._id,
      callId: `callId-${uuidv4()}`,
      tags: Array.isArray(body.tags) ? body.tags : body.tags.split(",").map(tag => tag.trim()),
      datetime: startDate,
      create_by: createdUser,
      isRecurent: frequency !== "NONE"
    };

    const schedule = await Schedule.create(scheduleData);

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate("category", "name")
      .populate("educator", "first_name last_name image")
      .populate("language", "name");

    await createLiveStreamForSchedule(schedule);

    // Single schedule (No recurrence)
    if (frequency === "NONE") {
      const rule = await RecurrenceRule.create({
        educator: createdUser._id,
        schedule: schedule._id,
        frequency,
        interval: 1,
        byWeekday: [],
        hasEndLimit: false,
        startDate,
        endDate: null,
        endType: null
      });

      schedule.recurrenceRuleId = rule._id;
      await schedule.save();

      const session = await RecurrenceSchedule.create({
        educator: createdUser._id,
        schedule: schedule._id,
        title: body.title,
        description: body.description,
        category: body.category,
        language: body.language,
        tags: body.tags,
        datetime: startDate,
        recurrenceRuleId: rule._id
      });

      return res.status(201).json({
        success: true,
        message: "Single session created successfully",
        schedule: populatedSchedule,
        session
      });
    }

    // Recurring Rules
    const rule = await RecurrenceRule.create({
      educator: createdUser._id,
      schedule: populatedSchedule._id,
      frequency,
      interval: recurrence.interval || 1,
      byWeekday: recurrence.byWeekday || [],
      hasEndLimit: recurrence.hasEndLimit || false,
      startDate,
      endDate,
      endType: recurrence.endType,
      occurrences: recurrence.occurrences || null
    });

    schedule.recurrenceRuleId = rule._id;
    await schedule.save();

    const sessionDates = generateDatesFromRule(rule);

    const createdSessions = await Promise.all(
      sessionDates.map(d =>
        RecurrenceSchedule.create({
          educator: createdUser._id,
          schedule: populatedSchedule._id,
          title: body.title,
          description: body.description,
          category: body.category,
          language: body.language,
          tags: body.tags,
          datetime: d,
          recurrenceRuleId: rule._id
        })
      )
    );

    res.status(201).json({
      success: true,
      message: "Recurring sessions created successfully",
      rule,
      schedules: createdSessions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================= UPDATE RECURRING =======================

export const updateRecurringSessions = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const body = req.body;

    // await createRecurringScheduleSchema.validate(body, { abortEarly: false });

    const updatedUser = req.user;
    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) return res.status(404).json({ success: false, message: "Not found" });

    const recurrence = body.recurrenceRule || {};
    const frequency = recurrence.frequency;
    const startDate = new Date(body.datetime);

    let endDate = null;

    if (frequency !== "NONE") {
      if (recurrence.endType === "DATE") {
        endDate = recurrence.endDateTime
          ? new Date(recurrence.endDateTime)
          : new Date(new Date(startDate).setMonth(startDate.getMonth() + 2));
      } else if (recurrence.endType !== "OCCURRENCES") {
        endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 2));
      }
    }

    // Update base schedule
    schedule.title = body.title;
    schedule.description = body.description;
    schedule.category = body.category;
    schedule.language = body.language;
    schedule.educator = body.educator;
    schedule.datetime = startDate;
    schedule.tags = Array.isArray(body.tags) ? body.tags : body.tags?.split(",").map(t => t.trim());
    schedule.isRecurent = frequency !== "NONE";
    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id);

    await updateLiveStreamForSchedule(populatedSchedule);

    // Single Session
    if (frequency === "NONE") {
      await RecurrenceSchedule.deleteMany({ schedule: schedule._id });
      await RecurrenceRule.deleteMany({ schedule: schedule._id });

      const rule = await RecurrenceRule.create({
        educator: updatedUser._id,
        schedule: schedule._id,
        frequency,
        interval: 1,
        byWeekday: [],
        hasEndLimit: false,
        startDate,
        endDate,
        endType: null,
        occurrences: null
      });

      const session = await RecurrenceSchedule.create({
        educator: updatedUser._id,
        schedule: schedule._id,
        title: body.title,
        description: body.description,
        category: body.category,
        language: body.language,
        tags: schedule.tags,
        datetime: startDate,
        recurrenceRuleId: rule._id
      });

      return res.status(200).json({
        success: true,
        message: "Single session updated successfully",
        schedule,
        session
      });
    }

    // Recurring Sessions (Update rule + regenerate)
    if (schedule.recurrenceRuleId) {
      await RecurrenceSchedule.deleteMany({
        recurrenceRuleId: schedule.recurrenceRuleId
      });
      await RecurrenceRule.findByIdAndDelete(schedule.recurrenceRuleId);
    }

    const newRule = await RecurrenceRule.create({
      educator: updatedUser._id,
      schedule: schedule._id,
      frequency,
      interval: recurrence.interval,
      byWeekday: recurrence.byWeekday,
      hasEndLimit: recurrence.hasEndLimit,
      startDate,
      endDate,
      endType: recurrence.endType,
      occurrences: recurrence.occurrences
    });

    const dates = generateDatesFromRule(newRule);

    const newSessions = await Promise.all(
      dates.map(dt =>
        RecurrenceSchedule.create({
          educator: updatedUser._id,
          schedule: schedule._id,
          title: body.title,
          description: body.description,
          category: body.category,
          language: body.language,
          tags: schedule.tags,
          datetime: dt,
          recurrenceRuleId: newRule._id
        })
      )
    );

    res.status(200).json({
      success: true,
      message: "Recurring sessions updated successfully",
      rule: newRule,
      schedules: newSessions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ======================= EXPORT ALL =======================

export default {
  listSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  viewSchedule,
  statusUpdate,
  createRecurringSessions,
  updateRecurringSessions
};
