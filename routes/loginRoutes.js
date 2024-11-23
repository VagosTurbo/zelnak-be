import { Router } from "express";
import { login } from "../controllers/authController.js";

const router = Router();

//route for login
router.post('/', login);

export default router;