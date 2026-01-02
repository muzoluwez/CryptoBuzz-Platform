import express from "express";
import { getAllEducator, getEducatorDetails } from "../../../controllers/user/educator.js";
import Auth from "../../../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllEducator);
router.get("/details/:educatorId", getEducatorDetails);

export default router;

