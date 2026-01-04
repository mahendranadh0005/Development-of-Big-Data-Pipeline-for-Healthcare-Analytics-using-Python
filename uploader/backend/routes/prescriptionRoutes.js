const express = require("express");
const router = express.Router(); // ✅ THIS WAS MISSING

const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

const Prescription = require("../models/Prescription");

const upload = multer({ dest: "uploads/" });

/**
 * CSV UPLOAD ROUTE
 */
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No CSV file uploaded" });
  }

  const prescriptions = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      prescriptions.push({
        prescription_id: row.prescription_id?.trim(),
        visit_id: row.visit_id?.trim(),
        patient_id: row.patient_id?.trim(),
        drug_name: row.drug_name,
        dosage: row.dosage,
        quantity: Number(row.quantity),
        days_supply: Number(row.days_supply),
        prescribed_date: row.prescribed_date,
      });
    })
    .on("end", async () => {
      try {
        if (prescriptions.length === 0) {
          return res.status(400).json({ message: "CSV is empty or invalid" });
        }

        await Prescription.insertMany(prescriptions);
        fs.unlinkSync(req.file.path);

        res.json({ message: "CSV uploaded and stored successfully" });
      } catch (error) {
        console.error("CSV INSERT ERROR:", error.message);
        res.status(500).json({ message: error.message });
      }
    })
    .on("error", (err) => {
      console.error("CSV PARSE ERROR:", err.message);
      res.status(500).json({ message: "Failed to parse CSV" });
    });
});

module.exports = router; // ✅ ALSO REQUIRED
