import express from "express"; // import the express module
import {
  getLanguageList,
  getLanguage,
  createLanguage,
  updateLanguage,
  deleteLanguage
} from "../../../controllers/admin/language.js";
import Auth from "../../../middlewares/auth.js";
const router = express.Router();

router.get("/list", Auth.AdminAuth, getLanguageList);
router.get("/", Auth.AdminAuth, getLanguage);
router.post("/", Auth.AdminAuth, createLanguage);
router.put("/:id", Auth.AdminAuth, updateLanguage);
router.delete("/:id", Auth.AdminAuth, deleteLanguage);

export default router;
