import express from "express";
import { getDoctors, addDoctor } from "../controllers/doctor.controller.js";
import { protect } from "../controllers/authcontroller.js";

const router = express.Router();

/* Admin only */
router.get("/", protect, getDoctors);
router.post("/", protect, addDoctor);

export default router;
