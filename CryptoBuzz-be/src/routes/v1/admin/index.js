import express from "express";
const router = express.Router();

import CategoryRoute from "./category.routes.js";
import LanguageRoute from "./language.routes.js";
import CoursesTypeRoute from "./coursesType.routes.js";
import SectionRoute from "./section.routes.js";


router.use("/category", CategoryRoute);
router.use("/language", LanguageRoute);
router.use("/course-type", CoursesTypeRoute);
router.use("/section", SectionRoute);

export default router;

