// backend2.0/routes/attributeRoutes.js
import { Router } from "express";
import { Roles } from "../enums/roles.js";
import { createAttribute, updateAttribute, deleteAttribute } from "../controllers/attributeController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

const permissions = {
    createAttribute: [Roles.Admin, Roles.Moderator],
    updateAttribute: [Roles.Admin, Roles.Moderator],
    deleteAttribute: [Roles.Admin, Roles.Moderator],
};

// Route to create an attribute
router.post("/", authenticateToken(permissions.createAttribute), createAttribute);

// Route to update an attribute
router.put("/:id", authenticateToken(permissions.updateAttribute), updateAttribute);

// Route to delete an attribute
router.delete("/:id", authenticateToken(permissions.deleteAttribute), deleteAttribute);

export default router;
