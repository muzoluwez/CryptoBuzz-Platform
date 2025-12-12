import express from "express";
import {provideList} from "../../../controllers/common/dashboard.js";
import Auth from "../../../middlewares/auth.js";

const router = express.Router();

router.get("/", Auth.CommonAuth, provideList);

export default router;
