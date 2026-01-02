import express from "express";
import Auth from "../../../middlewares/auth.js";
import { rateEducator } from "../../../controllers/user/rating.js";

const router = express.Router();

router.post("/", Auth.verifyJWT, rateEducator);

export default router;

