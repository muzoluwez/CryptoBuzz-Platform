import express from "express";
import {
  getLiveDetails,
  stopLiveStream,
  updateLiveStreamStatus,
  changeLiveStreamStatus,
  startCall,
  createLiveStreamOnTime,
  endAndCreate
} from "../../../controllers/educator/livestream.js";
import Auth from "../../../middlewares/auth.js";

const router = express.Router();

router.get("/list", Auth.CommonAuth, getLiveDetails);
router.post("/", Auth.CommonAuth, stopLiveStream);
router.put("/:callId/status", Auth.CommonAuth, updateLiveStreamStatus);
router.put("/:callId/live-status", Auth.CommonAuth, changeLiveStreamStatus);
router.put("/start", Auth.CommonAuth, startCall);
router.post("/create", Auth.CommonAuth, createLiveStreamOnTime);
router.post("/end-and-create", Auth.CommonAuth, endAndCreate);

export default router;
