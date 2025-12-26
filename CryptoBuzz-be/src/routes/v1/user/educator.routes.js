import express from "express";
import { getAllEducator } from "../../../controllers/user/educator.js";

const router = express.Router();

router.get("/", getAllEducator);

export default router;

