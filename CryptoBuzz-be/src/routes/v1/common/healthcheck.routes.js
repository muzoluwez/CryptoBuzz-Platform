import { Router } from "express";
import { healthcheck } from "../../../controllers/common/helthCheck.js";

const router = Router();

router.get("/", healthcheck);

export default router;
