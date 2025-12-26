import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import visitRoutes from "./routes/visit.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";

dotenv.config();

const app = express();

/* 🔑 REQUIRED FOR RENDER */
app.set("trust proxy", 1);

/* 🔑 HARDENED CORS */
const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server & same-origin
    if (!origin) return callback(null, true);

    const allowed = [
      "https://development-of-big-data-pipeline-for.vercel.app",
      "http://localhost:5173"
    ];

    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

/* 🔑 HANDLE PREFLIGHT EXPLICITLY */
app.options("*", cors(corsOptions));

app.use(express.json());

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

export default app;
