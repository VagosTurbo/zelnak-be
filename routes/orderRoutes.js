import { Router } from "express";
import { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder, getOrdersByUserId } from "../controllers/orderController.js";

const router = Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.get("/user/:id", getOrdersByUserId);

export default router;