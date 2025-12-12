import express  from"express"; // import the express module
import {getCategories,getOneCategory,fetchCategories,createCategory,updateCategory,deleteCategory}  from"../../../controllers/admin/category.js";
import Auth   from "../../../middlewares/auth.js";
const router = express.Router();


// Get all category with filters
router.get("/",  Auth.AdminAuth, getCategories);

// Get all category with status true
router.get("/list",  Auth.CommonAuth, fetchCategories);

// Get single category by ID
router.get("/:id",Auth.AdminAuth, getOneCategory);

// Create new category
router.post("/", Auth.AdminAuth, createCategory);

// Update category
router.put("/:id",Auth.AdminAuth, updateCategory);

// Delete category (soft delete)
router.delete("/:id",Auth.AdminAuth, deleteCategory);

export default router;
