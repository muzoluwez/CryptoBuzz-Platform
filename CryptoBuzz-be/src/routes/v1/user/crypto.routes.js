import express from "express";
import { getCryptos } from "../../../controllers/user/crypto.js";
import { verifyJWT } from "../../../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyJWT, getCryptos);

export default router;
