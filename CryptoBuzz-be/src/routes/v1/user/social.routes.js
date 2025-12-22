import express from "express";
import { getSocials } from "../../../controllers/user/social.js";
import { verifyJWT } from "../../../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyJWT, getSocials);

export default router;
