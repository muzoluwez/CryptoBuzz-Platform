import express from "express";
const router = express.Router();

import CategoryRoute from "./category.routes.js";


router.use("/category", CategoryRoute);

export default router;

