import express from "express";
import {getProfile,updateEducatorProfile} from "../../../controllers/admin/auth.js";
import Auth  from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

router.get("/profile", Auth.AdminAuth, getProfile);
router.put("/update", Auth.AdminAuth, upload.single("files"), updateEducatorProfile);

export default router;
