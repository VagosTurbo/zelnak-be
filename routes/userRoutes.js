import { Router } from "express"
import { deleteUser, getAllUsers, getUserById, updateUser, addUserEvent, removeUserEvent, getUserEvents } from "../controllers/userController.js";

const router = Router()

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/:userId/events", addUserEvent);
router.delete("/:userId/events", removeUserEvent);
router.get("/:userId/events", getUserEvents); 

export default router
