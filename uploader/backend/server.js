const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://development-of-big-data-pipeline-fo.vercel.app/"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 🔥 REQUIRED FOR CSV

app.use("/api/patients", require("./routes/patientRoutes"));
app.use("/api/visits", require("./routes/visitRoutes"));
app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
