import express from "express";
import {
  getTradeAnalysis,
  createTradeAnalysis,
  updateTradeAnalysis,
  deleteTradeAnalysis,
} from "../../../controllers/common/tradeAnalysis.js";

import  Auth  from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

router.get("/", Auth.CommonAuth, getTradeAnalysis);

router.post("/", Auth.CommonAuth, upload.array("files", 3 ), createTradeAnalysis);

router.put("/:id", Auth.CommonAuth, upload.array("files", 3 ), updateTradeAnalysis);

router.delete("/:id", Auth.CommonAuth, deleteTradeAnalysis);

export default router;
