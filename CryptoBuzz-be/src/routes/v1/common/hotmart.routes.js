import express from "express";
import { listHotmartProducts } from "../../../controllers/common/hotmart.js";
import { CommonAuth } from "../../../middlewares/auth.js";

const router = express.Router();

router.get("/products", CommonAuth, listHotmartProducts);

export default router;
