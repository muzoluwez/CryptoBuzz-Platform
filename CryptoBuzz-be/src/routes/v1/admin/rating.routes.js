import express from "express";
import Auth from "../../../middlewares/auth.js";
import { getEducatorsRatings } from "../../../controllers/admin/rating.js"

const router = express.Router();

router.get("/list", Auth.AdminAuth, getEducatorsRatings);

export default router;
