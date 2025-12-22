import express from "express";
import { signup, signIn } from "../../../controllers/user/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", signIn);

export default router;
