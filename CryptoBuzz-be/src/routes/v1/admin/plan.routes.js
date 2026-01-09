import express from "express";
import {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getHotmartProductsForPlan,
} from "../../../controllers/admin/plan.js";
import Auth from "../../../middlewares/auth.js";

const router = express.Router();

// Get Hotmart products (for plan creation) - Admin only
router.get("/hotmart-products", Auth.AdminAuth, getHotmartProductsForPlan);

// Plan CRUD operations
// GET endpoints: Allow both Admin and Educator to read plans (for course creation)
router.get("/", Auth.CommonAuth, getPlans);
router.get("/:id", Auth.CommonAuth, getPlan);
// POST, PUT, DELETE: Admin only (plan management)
router.post("/", Auth.AdminAuth, createPlan);
router.put("/:id", Auth.AdminAuth, updatePlan);
router.delete("/:id", Auth.AdminAuth, deletePlan);

export default router;
