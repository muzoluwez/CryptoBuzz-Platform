import express from "express";
import { getIdeas } from "../../../controllers/user/idea.js";
import { verifyJWT } from "../../../middlewares/auth.js";
const router = express.Router();

router.get("/", verifyJWT, getIdeas);

export default router;