import express from "express";
import { getSocials } from "../../../controllers/user/social.js";

const router = express.Router();

router.get("/",  getSocials);

export default router;
