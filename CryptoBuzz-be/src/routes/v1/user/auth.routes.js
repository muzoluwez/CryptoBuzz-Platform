import express from "express";
import { signup, signIn, verifyEmail } from "../../../controllers/user/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signIn);
router.get("/verify-email", verifyEmail);

export default router;
