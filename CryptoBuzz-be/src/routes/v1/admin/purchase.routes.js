import express from "express";
import { getAllPurchases, getPurchaseById } from "../../../controllers/admin/purchase.js";
import Auth from "../../../middlewares/auth.js";

const router = express.Router();

// Get all purchases (Admin only)
router.get("/", Auth.AdminAuth, getAllPurchases);

// Get single purchase by ID (Admin only)
router.get("/:id", Auth.AdminAuth, getPurchaseById);

export default router;
