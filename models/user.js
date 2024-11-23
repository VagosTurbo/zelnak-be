import { poolPromise, sql } from '../config/database.js';
import bcrypt from "bcrypt";

export const dbGetAllUsers = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM users");
    return result.recordset;
};

export const dbGetUserById = async (id) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM users WHERE id = @id");
    return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const dbFindUserByUsernameOrEmail = async (username, email) => {
    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("username", sql.NVarChar, username)
            .input("email", sql.NVarChar, email)
            .query(
                "SELECT id FROM users WHERE username = @username OR email = @email"
            );

        // If a user is found, return it, otherwise return null
        return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
        console.error("Database error:", error.message);
        throw new Error("Failed to query the database");
    }
};


export const dbCreateUser = async (newUser) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("username", sql.NVarChar, newUser.username)
        .input("password", sql.NVarChar, newUser.password)
        .input("email", sql.NVarChar, newUser.email)
        .input("role", sql.Int, newUser.role)
        .query(
            "INSERT INTO users (username, password, email, role) OUTPUT Inserted.id VALUES (@username, @password, @email, @role)"
        );
    return { id: result.recordset[0].id, ...newUser };
};

export const dbUpdateUser = async (id, updatedUser) => {
    if (!id || Object.keys(updatedUser).length === 0) {
        throw new Error("Invalid input: ID and at least one field to update are required.");
    }

    const pool = await poolPromise;
    const request = pool.request();

    // Prevent password updates
    if (updatedUser.password) {
        throw new Error("Password updates are not allowed via this method.");
    }

    // Dynamically build the SET clause and add inputs to the request
    const setClauses = [];
    for (const [key, value] of Object.entries(updatedUser)) {
        if (key === "created_at") {
            throw new Error("Cannot update 'created_at' field.");
        }
        const paramName = `@${key}`;
        setClauses.push(`${key} = ${paramName}`);
        if (key === "role") {
            request.input(key, sql.Int, value); // Role is an INT
        } else {
            request.input(key, sql.NVarChar, value); // Use NVarChar for username and email
        }
    }

    // Add the ID input
    request.input("id", sql.Int, id);

    const query = `UPDATE users SET ${setClauses.join(", ")} WHERE id = @id`;

    // Execute the query
    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
};


export const dbDeleteUser = async (id) => {
    const pool = await poolPromise;

    // Begin a transaction
    const transaction = pool.transaction();
    await transaction.begin();

    try {
        // Delete related events
        await transaction
            .request()
            .input("id", sql.Int, id)
            .query("DELETE FROM events WHERE user_id = @id");

        // Delete the user
        const result = await transaction
            .request()
            .input("id", sql.Int, id)
            .query("DELETE FROM users WHERE id = @id");

        await transaction.commit();

        return result.rowsAffected[0] > 0;
    } catch (error) {
        await transaction.rollback();
        console.error("Error deleting user:", error);
        throw error;
    }
};


export const dbVerifyUserCredentials = async (username, password) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("username", sql.NVarChar, username)
        .query("SELECT * FROM users WHERE username = @username");

    const user = result.recordset.length > 0 ? result.recordset[0] : null;

    if (!user) {
        return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
};

export const dbAddUserEvent = async (userId, eventId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('user_id', sql.Int, userId)
        .input('event_id', sql.Int, eventId)
        .query('INSERT INTO user_events (user_id, event_id) VALUES (@user_id, @event_id)');
    return result.rowsAffected[0] > 0;
};

export const dbRemoveUserEvent = async (userId, eventId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('user_id', sql.Int, userId)
        .input('event_id', sql.Int, eventId)
        .query('DELETE FROM user_events WHERE user_id = @user_id AND event_id = @event_id');
    return result.rowsAffected[0] > 0;
};

export const dbGetUserEvents = async (userId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('user_id', sql.Int, userId)
        .query('SELECT event_id FROM user_events WHERE user_id = @user_id');
    return result.recordset.map(row => row.event_id);
};