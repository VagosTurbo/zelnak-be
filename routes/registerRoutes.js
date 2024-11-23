import { Router } from "express";
import { register } from "../controllers/authController.js";

const router = Router();

//route for login
router.post('/', register);

export default router;