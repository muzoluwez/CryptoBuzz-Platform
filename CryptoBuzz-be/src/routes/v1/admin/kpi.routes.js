import express from "express";
import Auth from "../../../middlewares/auth.js";
import { kpi, kpiExportExcel, getEndedSession, listEducator } from "../../../controllers/admin/kpi.js";

const router = express.Router();

// Get KPI Report
router.get("/:callId", Auth.AdminAuth, kpi);

// Export KPI Excel
router.post("/", Auth.AdminAuth, kpiExportExcel);

router.get("/", Auth.AdminAuth, getEndedSession);

router.get("/get", Auth.AdminAuth, listEducator);

export default router;
