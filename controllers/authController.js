import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { dbVerifyUserCredentials, dbCreateUser, dbFindUserByUsernameOrEmail } from "../models/user.js"
import { Roles } from "../enums/roles.js"

const secretKey = process.env.JWT_SECRET // Use a strong secret key in production

export const login = async (req, res) => {
    const { username, password } = req.body

    try {
        const user = await dbVerifyUserCredentials(username, password)

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" })
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey, { expiresIn: "1h" })

        res.json({ token, id: user.id })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const register = async (req, res) => {
    const { username, email, password, role } = req.body

    try {
        // Validate input
        if (!username || !password || !email) {
            return res.status(400).json({ message: "Username, password, and email are required" })
        }

        // Check if user already exists
        const existingUser = await dbFindUserByUsernameOrEmail(username, email)
        if (existingUser) {
            return res.status(400).json({ message: "A user with this username or email already exists" })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user object
        const newUser = {
            username,
            email,
            password: hashedPassword,
            role: role || Roles.Registered, // Default role is Registered
        }

        // Create user in database
        await dbCreateUser(newUser)
        res.status(201).json({ message: "User registered successfully" })
    } catch (error) {
        console.error("Error during registration:", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}
