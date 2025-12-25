import express from "express";
import { getSchedules } from "../../../controllers/user/schedule.js";
const router = express.Router();

router.get("/", getSchedules);

export default router;