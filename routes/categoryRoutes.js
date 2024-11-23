// backend2.0/routes/categoryRoutes.js
import { Router } from "express";
import { Roles } from "../enums/roles.js";
import { getAllCategories, getCategoryById, createCategory, getCategoryHierarchy, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

const permissions = {
    getAllCategories: [],
    getCategoryById: [],
    createCategory: [],
    updateCategory: [Roles.Admin, Roles.Moderator],
    deleteCategory: [Roles.Admin, Roles.Moderator],
}

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", authenticateToken(permissions.updateCategory),updateCategory);
router.post("/",createCategory);
router.delete("/:id",authenticateToken(permissions.deleteCategory), deleteCategory);
router.get("/:categoryId/hierarchy", getCategoryHierarchy);


export default router;