import express from "express";
import { signinUser,getAffiliateInfo } from "../../../controllers/common/auth.js";
const router = express.Router();

router.post("/signin", signinUser);
router.get("/", getAffiliateInfo);

export default router;
