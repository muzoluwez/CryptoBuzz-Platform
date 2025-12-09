import express from "express"; // import the express module
import { signinUser } from "../../../controllers/common/auth.js";
const router = express.Router();

router.get("/signin", signinUser);

export default router;
