import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import visitRoutes from "./routes/visit.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";

dotenv.config();

const app = express();

/* REQUIRED FOR RENDER */
app.set("trust proxy", 1);

/* SAFE CORS FOR RENDER + VERCEL */
app.use(
  cors({
    origin: true, // ✅ allow all origins dynamically
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* HANDLE PREFLIGHT */
app.options("*", cors());

app.use(express.json());

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/doctors", doctorRoutes);


export default app;
