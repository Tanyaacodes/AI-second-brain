import User from "../models/user.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" })

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const userExists = await User.findOne({ email })
        if (userExists) return res.status(400).json({ message: "User already exists" })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = await User.create({ name, email, password: hashedPassword })

        const token = signToken(user._id)
        res.status(201).json({ message: "User registered", token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: "Invalid credentials" })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" })

        const token = signToken(user._id)
        res.json({ message: "Login success", token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


export const getMe = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) return res.status(401).json({ message: "No token" })
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret")
        const user = await User.findById(decoded.id).select('-password')
        if (!user) return res.status(404).json({ message: "User not found" })
        res.json({ user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } })
    } catch (err) {
        res.status(401).json({ message: "Invalid token" })
    }
}