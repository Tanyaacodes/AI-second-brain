import express from "express"
import { saveKnowledge, getallknowledge, searchKnowledge, resurfaceMemories, fetchUrlMetadata, deleteKnowledge, toggleRevisit, getCollections, uploadFileKnowledge } from "../controllers/knowledge.controller.js"
import { protect, optionalProtect } from "../middleware/authMiddleware.js"
import { storage } from "../config/cloudinary.js"
import multer from "multer"

const upload = multer({ storage });
const router = express.Router()

router.post("/save", optionalProtect, saveKnowledge)
router.post("/upload", protect, upload.single('file'), uploadFileKnowledge)
router.get("/", protect, getallknowledge)
router.get("/search", protect, searchKnowledge)
router.get("/resurface", protect, resurfaceMemories)
router.get("/scrape", optionalProtect, fetchUrlMetadata)
router.delete("/:id", protect, deleteKnowledge)
router.put("/:id/revisit", protect, toggleRevisit)
router.get("/collections", protect, getCollections)

export default router