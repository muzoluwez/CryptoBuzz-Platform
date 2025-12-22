import express from "express";
import { signup } from "../../../controllers/user/auth.js";

const router = express.Router();

router.post("/", signup);

export default router;
