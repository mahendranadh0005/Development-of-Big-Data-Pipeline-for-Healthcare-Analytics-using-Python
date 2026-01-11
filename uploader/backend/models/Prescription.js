const express = require("express");
const router = express.Router();

const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

const Prescription = require("../models/Prescription");

const upload = multer({ dest: "uploads/" });

/* ================= CSV UPLOAD ================= */
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No CSV file uploaded" });
  }

  const prescriptions = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      // Required for referential integrity
      if (!row.prescription_id || !row.visit_id || !row.patient_id) return;

      prescriptions.push({
        prescription_id: row.prescription_id.trim(),
        visit_id: row.visit_id.trim(),
        patient_id: row.patient_id.trim(),

        diagnosis_id: row.diagnosis_id?.trim() || "",
        diagnosis_description: row.diagnosis_description?.trim() || "",

        drug_name: row.drug_name?.trim() || "",
        dosage: row.dosage?.trim() || "",

        quantity: row.quantity ? parseInt(row.quantity, 10) : 0,
        days_supply: row.days_supply ? parseInt(row.days_supply, 10) : 0,

        cost: row.cost ? parseFloat(row.cost) : 0,

        prescribed_date: row.prescribed_date
          ? new Date(row.prescribed_date)
          : new Date("1970-01-01"),

        doctor_name: row.doctor_name?.trim() || ""
      });
    })
    .on("end", async () => {
      try {
        if (prescriptions.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "CSV empty or invalid" });
        }

        await Prescription.insertMany(prescriptions, { ordered: false });
        fs.unlinkSync(req.file.path);

        res.json({
          message: `Inserted ${prescriptions.length} prescriptions`
        });
      } catch (error) {
        console.error("CSV INSERT ERROR:", error);
        res.status(500).json({ message: error.message });
      }
    })
    .on("error", (err) => {
      console.error("CSV PARSE ERROR:", err);
      res.status(500).json({ message: "Failed to parse CSV" });
    });
});

module.exports = router;
