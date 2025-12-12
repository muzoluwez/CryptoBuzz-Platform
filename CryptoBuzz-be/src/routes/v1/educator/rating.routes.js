import express from "express";
import Auth from "../../../middlewares/auth.js";
import { getMyRatings } from "../../../controllers/educator/rating.js"

const router = express.Router();

router.get("/list", Auth.CommonAuth, getMyRatings);

export default router;