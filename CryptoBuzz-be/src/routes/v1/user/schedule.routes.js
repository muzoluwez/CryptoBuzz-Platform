import express from "express";
import { getSchedules, getToken, getActiveLiveStreamByEducator } from "../../../controllers/user/schedule.js";
const router = express.Router();

router.get("/", getSchedules);
router.post("/get-token", getToken);
router.get("/educator/:educatorId/active-live", getActiveLiveStreamByEducator);

export default router;