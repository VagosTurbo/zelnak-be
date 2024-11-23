/**
 * Events DONE
 */
import { Roles } from "../enums/roles.js"
import { dbGetAllEvents, dbGetEventById, dbCreateEvent, dbDeleteEvent, dbUpdateEvent } from "../models/event.js"

export const getAllEvents = async (req, res) => {
    try {
        const events = await dbGetAllEvents()
        res.json(events)
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve events: " + err.message })
    }
}

export const getEventById = async (req, res) => {
    try {
        const eventId = req.params.id

        if (!eventId) {
            return res.status(400).json({ error: "Event ID is required" })
        }

        const event = await dbGetEventById(eventId)

        if (!event) {
            return res.status(404).json({ error: "Event not found" })
        }

        res.json(event)
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve event: " + err.message })
    }
}

export const createEvent = async (req, res) => {
    try {
        const { name, description, date, location, user_id } = req.body

        if (!user_id) {
            return res.status(400).json({ error: "user_id is required" })
        }

        const eventCreated = await dbCreateEvent({ name, description, date, location, user_id })

        if (eventCreated) {
            res.status(201).json({ message: "Event created successfully" })
        } else {
            res.status(500).json({ error: "Failed to create event" })
        }
    } catch (err) {
        res.status(400).json({ error: "Failed to create event: " + err.message })
    }
}

export const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id
        const updatedEvent = {}

        if (req.body.name) updatedEvent.name = req.body.name
        if (req.body.description) updatedEvent.description = req.body.description
        if (req.body.date) updatedEvent.date = req.body.date
        if (req.body.location) updatedEvent.location = req.body.location

        if (Object.keys(updatedEvent).length === 0) {
            return res.status(400).json({ error: "At least one field is required to update" })
        }

        const existingEvent = await dbGetEventById(eventId)

        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" })
        }

        // Check if the user is authorized to update the event
        const userId = req.user.id // The logged-in user's ID from the token
        const userRole = req.user.role // The role from the token

        // Only allow the update if the user is an admin or the user who created the event
        if (userRole !== Roles.Admin && existingEvent.user_id !== userId) {
            return res.status(403).json({ error: "Forbidden: You are not authorized to update this event" })
        }

        // Proceed with updating the event
        const eventUpdated = await dbUpdateEvent(eventId, updatedEvent)

        if (eventUpdated) {
            res.json({ message: "Event updated successfully" })
        } else {
            res.status(500).json({ error: "Failed to update event" })
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to update event: " + err.message })
    }
}

export const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id

        if (!eventId) {
            return res.status(400).json({ error: "Event ID is required" })
        }

        const existingEvent = await dbGetEventById(eventId)

        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" })
        }

        // Check if the user is authorized to delete the event
        const userId = req.user.id // The logged-in user's ID from the token
        const userRole = req.user.role // The role from the token

        // Only allow the deletion if the user is an admin or the user who created the event
        if (userRole !== Roles.Admin && existingEvent.user_id !== userId) {
            return res.status(403).json({ error: "Forbidden: You are not authorized to delete this event" })
        }

        // Proceed with deleting the event
        await dbDeleteEvent(eventId)

        res.json({ message: "Event deleted successfully" })
    } catch (err) {
        res.status(500).json({ error: "Failed to delete event: " + err.message })
    }
}
