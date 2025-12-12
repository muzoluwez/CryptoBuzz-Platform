import UserModel from "../../models/user.js";
import IdeaModel from "../../models/idea.js";
import CourseModel from "../../models/course.js";
import ScheduleModel from "../../models/schedule.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const provideList = async (req, res) => {
  try {
    const findEducatorCount = await UserModel.countDocuments({ role: "educator" });
    const findIdeaCount = await IdeaModel.countDocuments();
    const findCourseCount = await CourseModel.countDocuments();
    const findScheduleCount = await ScheduleModel.countDocuments();

    const response = {
      findEducatorCount: findEducatorCount || 0,
      findIdeaCount: findIdeaCount || 0,
      findCourseCount: findCourseCount || 0,
      findScheduleCount: findScheduleCount || 0
    };
    return res.status(200).json(ApiResponse(200, response, "Record fetched successfully"));
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.errors || error.message
    });
  }
};
