import express from "express";
const router = express.Router();

import CategoryRoute from "./category.routes.js";
import LanguageRoute from "./language.routes.js";
import CoursesTypeRoute from "./coursesType.routes.js";
import SectionRoute from "./section.routes.js";
import EducatorRoute from "./educator.routes.js";
import KpiRoute from "./kpi.routes.js";
import TicketRoute from "./ticket.routes.js";


router.use("/category", CategoryRoute);
router.use("/language", LanguageRoute);
router.use("/course-type", CoursesTypeRoute);
router.use("/section", SectionRoute);
router.use("/educator", EducatorRoute);
router.use("/kpi", KpiRoute);
router.use("/ticket", TicketRoute);

export default router;

