import express from "express";
import { getIdeas } from "../../../controllers/user/idea.js";
const router = express.Router();

router.get("/",  getIdeas);

export default router;