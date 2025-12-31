import express from "express";
import { getSchedules, getToken, getActiveLiveStreamByEducator, getAllActiveLiveStreams } from "../../../controllers/user/schedule.js";
const router = express.Router();

router.get("/", getSchedules);
router.post("/get-token", getToken);
router.get("/educator/:educatorId/active-live", getActiveLiveStreamByEducator);
router.get("/active-live-streams", getAllActiveLiveStreams);

export default router;