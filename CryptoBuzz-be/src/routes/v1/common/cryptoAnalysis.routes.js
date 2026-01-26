import express from "express";
import {
  getCryptoAnalysis,
  createCryptoAnalysis,
  updateCryptoAnalysis,
  deleteCryptoAnalysis
} from "../../../controllers/common/cryptoAnalysis.js";

import Auth from "../../../middlewares/auth.js";
import { uploadCryptoMedia } from "../../../middlewares/multer.js";

const router = express.Router();

router.get("/", Auth.CommonAuth, getCryptoAnalysis);
router.post("/", Auth.CommonAuth, uploadCryptoMedia.single("files"), createCryptoAnalysis);
router.put("/:id", Auth.CommonAuth, uploadCryptoMedia.single("files"), updateCryptoAnalysis);
router.delete("/:id", Auth.CommonAuth, deleteCryptoAnalysis);

export default router;
