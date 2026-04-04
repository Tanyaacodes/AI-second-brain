import express from "express"
import { registerUser, loginUser, getMe, updateProfile } from "../controllers/authcontroller.js"
import { protect } from "../middleware/authMiddleware.js"
import { storage } from "../config/cloudinary.js"
import multer from "multer"

const upload = multer({ storage })
const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/me", getMe)
router.put("/profile", protect, upload.single('avatar'), updateProfile)

export default router