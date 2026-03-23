import express from "express"
import { saveKnowledge, getallknowledge, searchKnowledge, resurfaceMemories, fetchUrlMetadata, deleteKnowledge } from "../controllers/knowledge.controller.js"

const router = express.Router()

router.post("/save", saveKnowledge)
router.get("/", getallknowledge)
router.get("/search", searchKnowledge)
router.get("/resurface", resurfaceMemories)
router.get("/scrape", fetchUrlMetadata)
router.delete("/:id", deleteKnowledge)

export default router