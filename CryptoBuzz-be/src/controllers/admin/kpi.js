import ExcelJS from "exceljs";
import { fileURLToPath } from "url";
import { streamClient } from "../../utils/constants.js";

import UserModel from "../../models/user.js";
import LiveStreamModel from "../../models/liveStream.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// ----------------------------
// Helper Functions
// ----------------------------

function convertNanoToDate(nanoTs) {
  const millis = Math.floor(nanoTs / 1_000_000);
  return new Date(millis);
}

function convertNanosecondsToUTC(nsTimestamp) {
  const msTimestamp = nsTimestamp / 1e6;
  const date = new Date(msTimestamp);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    timeZone: "UTC"
  });
}

// ----------------------------
// KPI REPORT
// ----------------------------

export const kpi = async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId || typeof callId !== "string") {
      return res.status(400).json({ error: "Valid Call ID is required" });
    }

    const call = streamClient.video.call("livestream", callId);

    let report;
    try {
      report = await call.getCallReport();
    } catch (err) {
      return res.status(404).json({
        callId,
        message: "No report data available for this call ID"
      });
    }

    const participants = report?.report?.participants || {};
    const subscribers = participants?.subscribers || {};
    const publishers = participants?.publishers || {};
    const userRatings = report?.report?.user_ratings || {};

    const totalSubscribedSeconds = Number(subscribers?.total_subscribed_duration_seconds || 0);

    const watchTimeMinutes = Math.floor(totalSubscribedSeconds / 60);

    const responseData = {
      callId,
      sessionId: report?.session?.id || "-",
      status: report?.session?.ended_at ? "ended" : "active",
      startAt: report?.session?.started_at ? convertNanosecondsToUTC(report.session.started_at) : "-",
      endedAt: report?.session?.ended_at ? convertNanosecondsToUTC(report.session.ended_at) : "-",
      uniqueUsers: Number(participants?.unique || 0),
      peakConcurrent: Number(participants?.max_concurrent || 0),
      totalSessions: Number(participants?.sum || 0),
      subscribers: Number(subscribers?.unique || 0),
      publishers: Number(publishers?.unique || 0),
      userRatings: Number(userRatings?.count || 0),
      totalWatchTime: `${watchTimeMinutes}m`,
      timeline:
        participants?.count_over_time?.by_minute?.map(t => ({
          time: t?.start_ts ? convertNanoToDate(t.start_ts) : "-",
          first: Number(t?.first || 0),
          last: Number(t?.last || 0),
          max: Number(t?.max || 0),
          min: Number(t?.min || 0)
        })) || [],
      countryBreakdown: participants?.by_country || {},
      deviceBreakdown: participants?.by_device || {},
      osBreakdown: participants?.by_operating_system || {},
      browserBreakdown: participants?.by_browser || {}
    };

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch KPI report",
      details: err.message
    });
  }
};

// ----------------------------
// EXPORT KPI TO EXCEL
// ----------------------------

export const kpiExportExcel = async (req, res) => {
  try {
    const dataArray = req.body;

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return res.status(400).json({ error: "Array of data is required" });
    }

    const results = [];

    for (const item of dataArray) {
      const { title, educatorName, callIds } = item;

      if (!callIds) {
        results.push({
          title: title || "",
          educatorName: educatorName || "",
          callIds: "",
          totalWatchTime: "",
          uniqueUsers: "",
          peakConcurrent: "",
          totalSessions: "",
          subscribers: "",
          endedAt: "",
          startAt: ""
        });
        continue;
      }

      const call = streamClient.video.call("livestream", callIds);

      let report = null;
      try {
        report = await call.getCallReport();
      } catch {
        // Skip failures, still include empty row
      }

      let watchTimeMinutes = "";
      const totalSeconds = report?.report?.participants?.subscribers?.total_subscribed_duration_seconds;

      if (totalSeconds > 0) {
        watchTimeMinutes = Math.floor(totalSeconds / 60);
      }

      results.push({
        title: title || "",
        educatorName: educatorName || "",
        callIds: callIds || "",
        totalWatchTime: watchTimeMinutes ? `${watchTimeMinutes}m` : 0,
        uniqueUsers: report?.report?.participants?.unique || 0,
        peakConcurrent: report?.report?.participants?.max_concurrent || 0,
        totalSessions: report?.report?.participants?.sum || 0,
        subscribers: report?.report?.participants?.subscribers?.unique || 0,
        startAt: report?.session?.started_at ? convertNanosecondsToUTC(report.session.started_at) : "-",
        endedAt: report?.session?.ended_at ? convertNanosecondsToUTC(report.session.ended_at) : "-"
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("KPI Report");

    worksheet.columns = [
      { header: "Educator Name", key: "educatorName", width: 30 },
      { header: "Title", key: "title", width: 40 },
      { header: "Total Watch Time", key: "totalWatchTime", width: 20 },
      { header: "Unique Users", key: "uniqueUsers", width: 15 },
      { header: "Peak Concurrent", key: "peakConcurrent", width: 20 },
      { header: "Total Sessions", key: "totalSessions", width: 20 },
      { header: "Subscribers", key: "subscribers", width: 20 },
      { header: "Started At", key: "startAt", width: 25 },
      { header: "Ended At", key: "endedAt", width: 25 },
      { header: "Call IDs", key: "callIds", width: 70 }
    ];

    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    results.forEach(data => worksheet.addRow(data));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=kpi_report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to export KPI report" });
  }
};

export const listEducator = async (req, res) => {
  try {
    const filter = { role: "educator" };

    const existingUser = await UserModel.find(filter).sort({ createdAt: -1 });

    if (!existingUser) {
      return res.status(400).json({ message: "No record found" });
    }

    let response = existingUser.map(data => ({
      _id: data._id,
      first_name: data.first_name,
      last_name: data.last_name
      //   image: data.image
      //     ? data.image
      //     : `${process.env.URL}assets/default-image.png`,
      //   bannerImage: data.bannerImage
      //     ? data.bannerImage
      //     : `${process.env.URL}assets/default_banner.jpg`,
      //   email: data.email,
      //   role: data.role,
      //   status: data.status,
      //   bio: data.bio,
      //   is_create_stream: data.is_create_stream,
      //   is_access_trade_ideas: data.is_access_trade_ideas,
      //   is_access_trade_analysis: data.is_access_trade_analysis,
      //   createdAt: data.createdAt,
      //   updatedAt: data.updatedAt,
      //   educatorDetails: data.educatorId,
    }));
    return res.status(200).json(ApiResponse(200, response, "Records fetched successfully"));
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.errors || error.message
    });
  }
};

export const getEndedSession = async (req, res) => {
  try {
    let query = { status: "ended" };

    const educatorId = req.query.educatorId || null;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // Educator filter
    if (educatorId) {
      query.educator = educatorId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } }
        //  { first_name: { $regex: search, $options: "i" } },
        // { last_name: { $regex: search, $options: "i" } },
        //  { email: { $regex: search, $options: "i" } },
        // { description: { $regex: search, $options: "i" } },
        // { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Date filter
    if (startDate && endDate) {
      query.datetime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.datetime = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.datetime = { $lte: new Date(endDate) };
    }

    const totalCount = await LiveStreamModel.countDocuments(query);
    const existingData = await LiveStreamModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("educator");

    if (skip >= totalCount && totalCount !== 0) {
      return res.status(400).json({ message: "No records found" });
    }

    const pagination = {
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      currentRecords: existingData.length,
      totalRecords: totalCount
    };

    return res.status(200).json(GetApiResponse(200, existingData, pagination, "Records fetched successfully"));
  } catch (error) {
    console.error("❌ getEndedSession Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Something went wrong"
    });
  }
};

// Default export (optional)
export default { kpi, kpiExportExcel, getEndedSession, listEducator };
