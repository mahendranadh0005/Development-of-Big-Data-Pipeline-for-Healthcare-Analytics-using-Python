import express from "express";
import { upload } from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  uploadPrescriptions,
  getPrescriptions
} from "../controllers/prescription.controller.js";

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadPrescriptions);
router.get("/", protect, getPrescriptions);

export default router;
