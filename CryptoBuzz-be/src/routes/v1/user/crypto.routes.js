import express from "express";
import { getCryptos } from "../../../controllers/user/crypto.js";

const router = express.Router();

router.get("/", getCryptos);

export default router;
