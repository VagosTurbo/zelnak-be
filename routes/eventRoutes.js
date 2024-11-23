/**
 * Events DONE
 */
import { Roles } from "../enums/roles.js"
import { Router } from "express"
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from "../controllers/eventController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = Router()

const permissions = {
    getAllEvents: [],
    getEventById: [],
    createEvent: [Roles.Admin, Roles.Farmer],
    updateEvent: [Roles.Admin, Roles.Farmer],
    deleteEvent: [Roles.Admin, Roles.Farmer],
}

router.get("/", getAllEvents)
router.get("/:id", getEventById)
router.post("/", authenticateToken(permissions.createEvent), createEvent)
router.put("/:id", authenticateToken(permissions.updateEvent), updateEvent)
router.delete("/:id", authenticateToken(permissions.deleteEvent), deleteEvent)

export default router