import express from "express";
import {
  getCryptoAnalysis,
  createCryptoAnalysis,
  updateCryptoAnalysis,
  deleteCryptoAnalysis
} from "../../../controllers/common/cryptoAnalysis.js";

import Auth from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

router.get("/", Auth.CommonAuth, getCryptoAnalysis);
router.post("/", Auth.CommonAuth, upload.array("files", 3), createCryptoAnalysis);
router.put("/:id", Auth.CommonAuth, upload.array("files", 3), updateCryptoAnalysis);
router.delete("/:id", Auth.CommonAuth, deleteCryptoAnalysis);

export default router;
