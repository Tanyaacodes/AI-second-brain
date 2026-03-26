import express from "express"
import { saveKnowledge, getallknowledge, searchKnowledge, resurfaceMemories, fetchUrlMetadata, deleteKnowledge, toggleRevisit, getCollections } from "../controllers/knowledge.controller.js"

const router = express.Router()

router.post("/save", saveKnowledge)
router.get("/", getallknowledge)
router.get("/search", searchKnowledge)
router.get("/resurface", resurfaceMemories)
router.get("/scrape", fetchUrlMetadata)
router.delete("/:id", deleteKnowledge)
router.put("/:id/revisit", toggleRevisit)
router.get("/collections", getCollections)

export default router