import express from "express";
import { upload } from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadPatients, getPatients } from "../controllers/patient.controller.js";

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadPatients);
router.get("/", protect, getPatients);

export default router;
