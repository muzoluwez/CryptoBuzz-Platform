import express from "express";
import { getToken } from "../../../controllers/common/stream.js";
import Auth from "../../../middlewares/auth.js";

const router = express.Router();

router.post("/get-token", Auth.CommonAuth, getToken);

export default router;
