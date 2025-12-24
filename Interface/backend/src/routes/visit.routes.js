import express from "express";
import { upload } from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadVisits, getVisits } from "../controllers/visit.controller.js";

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadVisits);
router.get("/", protect, getVisits);

export default router;
