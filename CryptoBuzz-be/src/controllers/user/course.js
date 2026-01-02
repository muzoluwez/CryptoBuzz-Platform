import Course from "../../models/course.js";
import yup from "yup";
import mongoose from "mongoose";
import Category from "../../models/category.js";
import SectionModel from "../../models/section.js";
import LanguageModel from "../../models/language.js";
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

    let query = { section: mainSection, published: true };
    if (categoryId) query.category = categoryId;
    if (language) query.language = language;
    if (id) query._id = id;

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
      const singleCourse = await Course.findOne({
        _id: id ? id : coursesData[0]?._id,
        section: mainSection,
        category: categoryId ? categoryId : coursesData[0]?.category._id,
        language: language ? language : coursesData[0]?.language
      })
        .sort({ createdAt: -1 })
        .lean();

      const categoriesActiveData = await Category.find({
        _id: { $in: categoryId ? categoryId : coursesData[0]?.category._id },
        status: true
      });

      const languageActiveData = await LanguageModel.find({
        status: true,
        name: language ? language : coursesData[0]?.language
      })
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
      let courseQuery = { section: mainSection };

      const categoriesActiveData = await Category.find({
        _id: { $in: categoryId ? categoryId : coursesData[0]?.category._id },
        status: true
      });

      const languageActiveData = await LanguageModel.find({
        status: true,
        name: language ? language : coursesData[0]?.language
      })
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
        if (categoryId) courseQuery.category = categoryId;
        if (language) courseQuery.language = language;
        if (id) courseQuery._id = id;
      }

      courses = await Course.find(courseQuery).sort({ createdAt: 1 }).lean();
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
          imageUrl: item.imageUrl
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
      .populate("lectures", "title description videoUrl thumbnailUrl type content")
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
        lectures: (section.lectures || []).map(lec => ({
          _id: lec._id,
          title: lec.title,
          type: lec.type,
          description: lec.description,
          thumbnailUrl: lec.thumbnailUrl,
          content: lec.content,
          videoUrl: lec.videoUrl
        }))
      });
    });

    const allCourses = coursesData.slice(1).map(item => ({
      _id: item._id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl
    }));

    const activeCourse = allCourses.filter(course => course._id.toString() == id);

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
      activeCourse
    });
  } catch (err) {
    console.error("getAllCategoriesWithSection error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

export default { CourseBasedOnSection };
