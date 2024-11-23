import { Router } from "express"
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js"
import { Roles } from "../enums/roles.js"
import { authenticateToken } from "../middleware/auth.js"

const router = Router()

const permissions = {
    getAllProducts: [],
    getProductById: [],
    createProduct: [Roles.Admin, Roles.Farmer, Roles.Registered],
    updateProduct: [Roles.Admin, Roles.Farmer, Roles.Registered],
    deleteProduct: [Roles.Admin, Roles.Farmer, Roles.Registered],
}

router.get("/", getAllProducts)
router.get("/:id", getProductById)
router.post("/", authenticateToken(permissions.createProduct), createProduct)
router.put("/:id",authenticateToken(permissions.updateProduct), updateProduct)
router.delete("/:id",authenticateToken(permissions.deleteProduct), deleteProduct)


export default router
