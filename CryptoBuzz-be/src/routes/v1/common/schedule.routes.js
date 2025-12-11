import express from "express";
import {
  listSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  viewSchedule,
  statusUpdate,
  createRecurringSessions,
  updateRecurringSessions
} from "../../../controllers/common/schedule.js";

import Auth from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

router.get("/", Auth.CommonAuth, listSchedule);

router.post("/", Auth.CommonAuth, upload.single("files"), createSchedule);

router.get("/:id", Auth.CommonAuth, viewSchedule);

router.put("/:id", Auth.CommonAuth, upload.single("files"), updateSchedule);

router.delete("/:id", Auth.CommonAuth, deleteSchedule);

router.put("/status/:userId", Auth.CommonAuth, statusUpdate);

router.post("/recurrence", Auth.CommonAuth, upload.single("files"), createRecurringSessions);

router.put("/recurrence/:id", Auth.CommonAuth, upload.single("files"), updateRecurringSessions);

export default router;
