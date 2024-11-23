import { Roles } from "../enums/roles.js"
import { dbGetAllUsers, dbGetUserById, dbCreateUser, dbUpdateUser, dbDeleteUser, dbAddUserEvent, dbRemoveUserEvent, dbGetUserEvents } from "../models/user.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await dbGetAllUsers()
        res.json(users)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const getUserById = async (req, res) => {
    try {
        const user = await dbGetUserById(req.params.id)
        res.json(user)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const createUser = async (req, res) => {
    const { username, password, email, role } = req.body

    const newUser = {
        username,
        password,
        email,
        role: Roles.Registered
    }

    try {
        await dbCreateUser(newUser)
        res.json({ message: "User created successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const updateUser = async (req, res) => {
    const userId = req.params.id;
    const updatedUser = {};

    // Only include fields that are allowed to be updated
    if (req.body.username) updatedUser.username = req.body.username;
    if (req.body.email) updatedUser.email = req.body.email;
    if (req.body.role) updatedUser.role = req.body.role;

    // there must be at least one field to update
    if (Object.keys(updatedUser).length === 0) {
        return res.status(400).json({ error: "At least one field is required to update." });
    }

    try {
        // Does the user exist?
        const existingUser = await dbGetUserById(userId);
        if (!existingUser) {
            return res.status(404).json({ error: "User not found." });
        }

        // Exclude 'created_at' and 'user_id' fields from the update
        const { created_at, user_id, ...userToUpdate } = updatedUser;

        // Pass only the allowed fields to dbUpdateUser
        await dbUpdateUser(userId, userToUpdate);
        res.json({ message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    const userId = req.params.id

    try {
        // test existence
        const existingUser = await dbGetUserById(userId)
        if (!existingUser) {
            return res.status(404).json({ error: "User not found." })
        }

        const result = await dbDeleteUser(userId)

        // was the user deleted?
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found." })
        }

        res.json({ message: "User deleted successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const addUserEvent = async (req, res) => {
    const userId = req.params.userId;
    const eventId = req.body.eventId;

    try {
        const success = await dbAddUserEvent(userId, eventId);
        if (success) {
            res.json({ message: 'Event added successfully' });
        } else {
            res.status(500).json({ error: 'Failed to add event' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const removeUserEvent = async (req, res) => {
    const userId = req.params.userId;
    const eventId = req.body.eventId;

    try {
        const success = await dbRemoveUserEvent(userId, eventId);
        if (success) {
            res.json({ message: 'Event removed successfully' });
        } else {
            res.status(500).json({ error: 'Failed to remove event' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserEvents = async (req, res) => {
    const userId = req.params.userId;

    try {
        const events = await dbGetUserEvents(userId);
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};