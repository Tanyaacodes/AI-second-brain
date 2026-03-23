import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { connectDB } from "./config/db.js"
import knowledgeRoutes from "./routes/knowledge.routes.js"
import authRoutes from "./routes/authRoutes.js"

dotenv.config()

const app = express()

// Middleware
app.use(cors()) 
app.use(express.json())

// Connect to Database
connectDB()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/v1/knowledge", knowledgeRoutes)

app.get("/", (req, res) => {
    res.send("Dea Intelligent Storage Server is Active.")
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`\n🚀 Dea Backend running on http://localhost:${PORT}`)
})