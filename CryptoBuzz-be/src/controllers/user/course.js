import Course from "../../models/course.js";
import yup from "yup";
import mongoose from "mongoose";
import Category from "../../models/category.js";
import SectionModel from "../../models/section.js";
import LanguageModel from "../../models/language.js";
import courseProgress from "../../models/courseProgress.js";
import Lecture from "../../models/lecture.js";
// import Schedule from "../../model/schedule.model.js";
// import RecurrenceSchedule from "../../model/RecurrenceSchedule.js";

const fixedStart = ["Forex", "Crypto"];
const fixedEnd = ["Digital Marketing"];

function sortCategories(data) {
  const start = data
    .filter((cat) => fixedStart.includes(cat.name))
    .sort((a, b) => fixedStart.indexOf(a.name) - fixedStart.indexOf(b.name));

  const end = data.filter((cat) => fixedEnd.includes(cat.name));

  const middle = data.filter(
    (cat) => !fixedStart.includes(cat.name) && !fixedEnd.includes(cat.name)
  );

  return [...start, ...middle, ...end];
}

export const CourseBasedOnSection = async (req, res) => {
  try {
    // const user = req.user.plan;

    // if (!user) {
    //   return res.status(400).json({ success: false, message: "plan is required to show the api" });
    // }

    // const ids = user.allowedCategories;
    // const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

    const { mainSection, categoryId, language, id } = req.query;

    if (!mainSection) {
      return res.status(400).json({ success: false, message: "mainSection is required" });
    }

    // Build query with explicit isDeleted filter
    let query = {
      section: mainSection,
      published: true,
      isDeleted: false  // Explicitly filter out deleted courses
    };

    if (categoryId) {
      // Ensure categoryId is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(categoryId)) {
        query.category = new mongoose.Types.ObjectId(categoryId);
      } else {
        return res.status(400).json({ success: false, message: "Invalid categoryId format" });
      }
    }

    // Handle language with trim and regex to match even if database has trailing spaces
    if (language) {
      const trimmedLanguage = language.trim();
      // Use regex to handle trailing/leading whitespace in database
      query.language = { $regex: new RegExp(`^${trimmedLanguage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') };
    }
    if (id) {
      // Ensure id is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        query._id = new mongoose.Types.ObjectId(id);
      } else {
        return res.status(400).json({ success: false, message: "Invalid course id format" });
      }
    }

    // Fetch all courses for AllCourse data
    const coursesData = await Course.find(query).sort({ createdAt: 1 }).populate("category", "_id name").lean();
    const categoriesData = await Category.find({
      // _id: { $in: objectIds },
      status: true
    })
      .select("_id name")
      .lean();

    const sortedCategories = sortCategories(categoriesData);

    const languageData = await LanguageModel.find({ status: true }).select("_id name").lean();

    let courses = [];

    if (mainSection) {
      // If both ID and section are provided, find single course
      const singleCourseQuery = {
        section: mainSection,
        published: true,
        isDeleted: false  // Explicitly filter out deleted courses
      };

      if (id) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          singleCourseQuery._id = new mongoose.Types.ObjectId(id);
        }
      } else if (coursesData[0]?._id) {
        singleCourseQuery._id = coursesData[0]._id;
      }

      if (categoryId) {
        if (mongoose.Types.ObjectId.isValid(categoryId)) {
          singleCourseQuery.category = new mongoose.Types.ObjectId(categoryId);
        }
      } else if (coursesData[0]?.category?._id) {
        singleCourseQuery.category = coursesData[0].category._id;
      }

      if (language) {
        const trimmedLanguage = language.trim();
        singleCourseQuery.language = { $regex: new RegExp(`^${trimmedLanguage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') };
      } else if (coursesData[0]?.language) {
        const trimmedLang = String(coursesData[0].language).trim();
        singleCourseQuery.language = { $regex: new RegExp(`^${trimmedLang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') };
      }

      const singleCourse = await Course.findOne(singleCourseQuery)
        .populate("recommendedCourses", "_id title description imageUrl price tier")
        .sort({ createdAt: -1 })
        .lean();

      const categoryIdForQuery = categoryId
        ? categoryId
        : (coursesData[0]?.category?._id ? coursesData[0].category._id : null);

      const categoriesActiveData = categoryIdForQuery
        ? await Category.find({
          _id: mongoose.Types.ObjectId.isValid(categoryIdForQuery)
            ? new mongoose.Types.ObjectId(categoryIdForQuery)
            : categoryIdForQuery,
          status: true
        })
        : await Category.find({ status: true });

      const languageForQuery = language || coursesData[0]?.language || null;

      const languageActiveData = languageForQuery
        ? await LanguageModel.find({
          status: true,
          name: languageForQuery
        })
          .select("_id name")
          .lean()
        : await LanguageModel.find({ status: true })
          .select("_id name")
          .lean();

      if (!singleCourse) {
        return res.status(200).json({
          success: true,
          mainSection,
          ActiveLanguage: languageActiveData.map(lang => ({
            language: lang.name
          })),
          ActiveCategory: categoriesActiveData.map(cat => ({
            categoryId: cat._id,
            categoryName: cat.name
          })),
          language: languageData,
          categories: sortCategories(categoriesData),
          course: [],
          AllCourse: coursesData.map(item => ({
            tier: item.tier,
            price: item.price,
            hotmartProductId: item.hotmartProductId,
            _id: item._id,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl
          }))
        });
      }

      courses.push(singleCourse); // put into array for consistent handling
    } else {
      // If no filters applied, use first course
      let courseQuery = {
        section: mainSection,
        published: true,
        isDeleted: false  // Explicitly filter out deleted courses
      };

      const categoryIdForQuery = categoryId
        ? (mongoose.Types.ObjectId.isValid(categoryId) ? new mongoose.Types.ObjectId(categoryId) : null)
        : (coursesData[0]?.category?._id ? coursesData[0].category._id : null);

      const categoriesActiveData = categoryIdForQuery
        ? await Category.find({
          _id: categoryIdForQuery,
          status: true
        })
        : await Category.find({ status: true });

      const languageForQuery = language || coursesData[0]?.language || null;

      const languageActiveData = languageForQuery
        ? await LanguageModel.find({
          status: true,
          name: languageForQuery
        })
          .select("_id name")
          .lean()
        : await LanguageModel.find({ status: true })
          .select("_id name")
          .lean();

      if (!categoryId && !language && !id) {
        if (!coursesData.length) {
          return res.status(200).json({
            success: false,
            message: "No courses available",
            mainSection,
            ActiveLanguage: languageActiveData.map(lang => ({
              language: lang.name
            })),
            ActiveCategory: categoriesActiveData.map(cat => ({
              categoryId: cat._id,
              categoryName: cat.name
            })),
            language: languageData,
            categories: sortCategories(categoriesData),
            course: [],
            AllCourse: []
          });
        }
        courseQuery._id = coursesData[0]._id;
      } else {
        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
          courseQuery.category = new mongoose.Types.ObjectId(categoryId);
        }
        if (language) {
          const trimmedLanguage = language.trim();
          courseQuery.language = { $regex: new RegExp(`^${trimmedLanguage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') };
        }
        if (id && mongoose.Types.ObjectId.isValid(id)) {
          courseQuery._id = new mongoose.Types.ObjectId(id);
        }
      }

      courses = await Course.find(courseQuery)
        .populate("recommendedCourses", "_id title description imageUrl price tier")
        .sort({ createdAt: 1 })
        .lean();
    }

    // If no course found after filters
    if (!courses.length) {
      return res.status(200).json({
        success: false,
        mainSection,
        language: languageData,
        categories: sortCategories(categoriesData),
        course: [],
        AllCourse: coursesData.map(item => ({
          _id: item._id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          tier: item.tier,
          price: item.price,
          hotmartProductId: item.hotmartProductId
        }))
      });
    }

    // STEP 2: Extract required values
    const courseSectionId = courses.map(c => c.sections).flat();

    const categoryIds = [...new Set(courses.map(c => c.category?.toString()).filter(Boolean))];
    const findCategory = courses.map(c => c.category._id?.toString());

    const languages = [...new Set(courses.map(c => c.language).filter(Boolean))];

    // STEP 3: Fetch categories
    const categories = await Category.find({ _id: findCategory }).select("_id name").lean();

    // STEP 4: Fetch Sections + Lectures
    const allSections = await SectionModel.find({
      _id: { $in: courseSectionId }
    })
      .sort({ order: 1, createdAt: -1 })
      .populate("lectures", "title description videoUrl thumbnailUrl type content duration")
      .lean();

    // STEP 5: Group Sections by Course
    const sectionsByCourse = {};
    allSections.forEach(section => {
      const courseId = section.course.toString();
      if (!sectionsByCourse[courseId]) sectionsByCourse[courseId] = [];

      sectionsByCourse[courseId].push({
        _id: section._id,
        title: section.title,
        order: section.order,
        course: courseId,
        courseTitle: courses.find(c => c._id.toString() === courseId)?.title || "",
        courseDescription: courses.find(c => c._id.toString() === courseId)?.description || "",
        lectures: (section.lectures || []).map(lec => ({
          _id: lec._id,
          title: lec.title,
          type: lec.type,
          description: lec.description,
          thumbnailUrl: lec.thumbnailUrl,
          content: lec.content,
          videoUrl: lec.videoUrl,
          duration: lec.duration
        }))
      });
    });

    const allCourses = coursesData.slice(1).map(item => ({
      _id: item._id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      tier: item.tier,
      price: item.price,
      hotmartProductId: item.hotmartProductId
    }));

    const activeCourse = allCourses.filter(course => course._id.toString() == id);

    // Get recommended courses from the current course(s)
    let recommendedCoursesData = [];
    if (courses.length > 0 && courses[0].recommendedCourses) {
      recommendedCoursesData = courses[0].recommendedCourses.map(recCourse => ({
        _id: recCourse._id,
        id: recCourse._id,
        title: recCourse.title,
        description: recCourse.description,
        imageUrl: recCourse.imageUrl,
        price: recCourse.price || 0,
        tier: recCourse.tier || "PUBLIC"
      }));
    }

    return res.status(200).json({
      success: true,
      mainSection,
      language: languageData,
      categories: sortCategories(categoriesData),
      ActiveLanguage: languages.map(lang => ({ language: lang })),
      ActiveCategory: categories.map(cat => ({
        categoryId: cat._id,
        categoryName: cat.name
      })),
      course: Object.values(sectionsByCourse).flat(),
      upcomingCourse: allCourses,
      activeCourse,
      recommendedCourses: recommendedCoursesData
    });
  } catch (err) {
    console.error("CourseBasedOnSection error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      query: req.query
    });
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Get all courses for marketplace
 * Returns all published courses with optional filtering by language, category, and pagination
 * Note: Returns courses from ALL sections (not filtered by section) to include admin courses
 */
export const getAllCoursesForMarketplace = async (req, res) => {
  try {
    const { language, categoryId, category, page = 1, limit = 100 } = req.query;

    // Build query - only published and not deleted courses
    // IMPORTANT: Do NOT filter by section - we want ALL courses from ALL sections
    // This ensures admin courses are included regardless of their section value
    let query = {
      published: true,
      isDeleted: false
    };

    // Filter by language if provided
    if (language) {
      const trimmedLanguage = language.trim();
      query.language = {
        $regex: new RegExp(`^${trimmedLanguage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i')
      };
    }

    // Filter by category if provided (support both 'category' and 'categoryId' for compatibility)
    const categoryParam = categoryId || category;
    if (categoryParam) {
      if (mongoose.Types.ObjectId.isValid(categoryParam)) {
        query.category = new mongoose.Types.ObjectId(categoryParam);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId format"
        });
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    // Debug: Log the query to help identify issues
    console.log("Marketplace query:", JSON.stringify(query, null, 2));

    // Fetch courses with pagination
    // Note: We explicitly do NOT filter by section or createdBy to include ALL published courses
    const courses = await Course.find(query)
      .select("_id title description imageUrl price tier category language instructor createdAt section createdBy")
      .populate("category", "_id name")
      .populate("instructor", "first_name last_name email image")
      .populate("createdBy", "first_name last_name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(query);

    // Debug: Log course count and sample courses
    console.log(`Marketplace: Found ${courses.length} courses (total: ${totalCourses})`);
    if (courses.length > 0) {
      console.log("Sample course sections:", courses.slice(0, 5).map(c => ({
        id: c._id,
        title: c.title,
        section: c.section,
        published: true,
        createdBy: c.createdBy?._id
      })));
    }

    // Format response to match frontend expectations
    const formattedCourses = courses.map(course => ({
      _id: course._id,
      id: course._id, // Also include as 'id' for compatibility
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      price: course.price || 0,
      tier: course.tier || "PUBLIC",
      hotmartProductId: course.hotmartProductId || null,
      section: course.section || null, // Include section for debugging
      category: course.category ? {
        _id: course.category._id,
        name: course.category.name
      } : null,
      language: course.language,
      instructor: course.instructor ? {
        _id: course.instructor._id,
        first_name: course.instructor.first_name,
        last_name: course.instructor.last_name,
        email: course.instructor.email,
        image: course.instructor.image
      } : null,
      createdBy: course.createdBy ? {
        _id: course.createdBy._id,
        role: course.createdBy.role,
        name: `${course.createdBy.first_name || ''} ${course.createdBy.last_name || ''}`.trim()
      } : null,
      createdAt: course.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: formattedCourses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCourses,
        totalPages: Math.ceil(totalCourses / limitNum)
      }
    });
  } catch (error) {
    console.error("getAllCoursesForMarketplace error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getCourseProgress = async (req, res) => {
  const userId = req.user._id;
  const { courseId } = req.params;

  const progress = await courseProgress.findOne({
    user: userId,
    course: courseId,
  });

  return res.status(200).json({
    success: true,
    courseId,
    completedLectures: progress?.completedLectures || [],
    progressPercentage: progress?.progressPercentage || 0,
  });
};

export const markLectureComplete = async (req, res) => {
  const userId = req.user._id;
  const { courseId, lectureId } = req.body;

  let progress = await courseProgress.findOne({ user: userId, course: courseId });

  if (!progress) {
    progress = await courseProgress.create({
      user: userId,
      course: courseId,
      completedLectures: [],
    });
  }

  if (!progress.completedLectures.includes(lectureId)) {
    progress.completedLectures.push(lectureId);
  }

  const totalLectures = await Lecture.countDocuments({
    section: { $exists: true },
  });

  progress.progressPercentage =
    (progress.completedLectures.length / totalLectures) * 100;

  progress.isCompleted = progress.progressPercentage === 100;

  await progress.save();

  return res.status(200).json({ success: true });
};

export const undoLectureComplete = async (req, res) => {
  const userId = req.user._id;
  const { courseId, lectureId } = req.body;

  if (!courseId || !lectureId) {
    return res.status(400).json({
      success: false,
      message: "courseId and lectureId are required",
    });
  }

  let progress = await courseProgress.findOne({
    user: userId,
    course: courseId,
  });

  // If no progress exists, nothing to undo
  if (!progress) {
    return res.status(200).json({
      success: true,
      message: "No progress found",
    });
  }

  // Remove lectureId if exists
  progress.completedLectures = progress.completedLectures.filter(
    (id) => id.toString() !== lectureId.toString()
  );

  // ⚠️ IMPORTANT: count only lectures of THIS course
  const totalLectures = await Lecture.countDocuments({
    section: { $exists: true },
  });

  progress.progressPercentage =
    totalLectures > 0
      ? (progress.completedLectures.length / totalLectures) * 100
      : 0;

  progress.isCompleted = progress.progressPercentage === 100;

  await progress.save();

  return res.status(200).json({
    success: true,
    completedLectures: progress.completedLectures,
    progressPercentage: progress.progressPercentage,
  });
};



export default { CourseBasedOnSection, getAllCoursesForMarketplace, getCourseProgress, markLectureComplete, undoLectureComplete };
