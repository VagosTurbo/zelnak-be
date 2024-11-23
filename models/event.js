/**
 * Events DONE
 */
import { poolPromise, sql } from "../config/database.js"

export const dbGetAllEvents = async () => {
    try {
        const pool = await poolPromise
        const result = await pool.request().query("SELECT * FROM dbo.events") // Ensure schema-qualified table name
        return result.recordset // Return the rows
    } catch (error) {
        console.error("Error fetching all events:", error)
        throw error
    }
}

export const dbGetEventById = async (id) => {
    try {
        const pool = await poolPromise
        const result = await pool.request().input("id", sql.Int, id).query("SELECT * FROM dbo.events WHERE id = @id")

        return result.recordset.length > 0 ? result.recordset[0] : null // Return the first row or null
    } catch (error) {
        console.error(`Error fetching event with ID ${id}:`, error)
        throw error
    }
}

export const dbCreateEvent = async (event) => {
    const { name, description, date, location, user_id } = event

    const pool = await poolPromise
    const transaction = pool.transaction()
    await transaction.begin()

    try {
        // Check if the user exists
        const userCheck = await transaction.request().input("user_id", sql.Int, user_id).query("SELECT COUNT(*) as count FROM dbo.users WHERE id = @user_id")

        if (userCheck.recordset[0].count === 0) {
            throw new Error(`User with ID ${user_id} does not exist.`)
        }

        // Insert the event
        const result = await transaction
            .request()
            .input("name", sql.NVarChar, name)
            .input("description", sql.NVarChar, description)
            .input("date", sql.Date, date)
            .input("location", sql.NVarChar, location)
            .input("user_id", sql.Int, user_id)
            .query("INSERT INTO dbo.events (name, description, date, location, user_id) VALUES (@name, @description, @date, @location, @user_id)")

        await transaction.commit()
        return result.rowsAffected[0] > 0 // Return true if insertion succeeded
    } catch (error) {
        await transaction.rollback()
        console.error("Error creating event:", error)
        throw error
    }
}

export const dbUpdateEvent = async (id, updatedEvent) => {
    try {
        const pool = await poolPromise

        // Dynamically construct the SET clause
        const setClauses = []
        const inputs = { id }

        if (updatedEvent.name) {
            setClauses.push("name = @name")
            inputs.name = updatedEvent.name
        }
        if (updatedEvent.description) {
            setClauses.push("description = @description")
            inputs.description = updatedEvent.description
        }
        if (updatedEvent.date) {
            setClauses.push("date = @date")
            inputs.date = updatedEvent.date
        }
        if (updatedEvent.location) {
            setClauses.push("location = @location")
            inputs.location = updatedEvent.location
        }

        const query = `
            UPDATE dbo.events
            SET ${setClauses.join(", ")}
            WHERE id = @id
        `

        const request = pool.request()
        Object.keys(inputs).forEach((key) => {
            request.input(key, inputs[key] instanceof Date ? sql.DateTime : sql.NVarChar, inputs[key])
        })

        const result = await request.query(query)
        return result.rowsAffected[0] > 0 // Return true if rows were affected
    } catch (error) {
        console.error(`Error updating event with ID ${id}:`, error)
        throw error
    }
}

export const dbDeleteEvent = async (id) => {
    try {
        const pool = await poolPromise
        const result = await pool.request().input("id", sql.Int, id).query("DELETE FROM dbo.events WHERE id = @id")
        return result.rowsAffected[0] > 0 // Return true if rows were affected
    } catch (error) {
        console.error(`Error deleting event with ID ${id}:`, error)
        throw error
    }
}
