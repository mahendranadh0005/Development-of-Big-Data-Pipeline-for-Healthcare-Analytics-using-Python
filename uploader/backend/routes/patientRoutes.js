const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

const Patient = require("../models/Patient");

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No CSV uploaded" });
  }

  const patients = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      // patient_id is the ONLY mandatory field
      if (!row.patient_id) return;

      const age = row.age ? Number(row.age) : null;
      const bmi = row.bmi ? Number(row.bmi) : null;

      patients.push({
        patient_id: row.patient_id.trim(),
        full_name: row.full_name || null,
        age: isNaN(age) ? null : age,
        gender: row.gender || null,
        blood_group: row.blood_group || null,
        phone_number: row.phone_number || null,
        email: row.email || null,
        emergency_contact: row.emergency_contact || null,
        hospital_location: row.hospital_location || null,
        bmi: isNaN(bmi) ? null : bmi,
        smoker_status: row.smoker_status || null,
        alcohol_use: row.alcohol_use || null,
        chronic_conditions:
          row.chronic_conditions && row.chronic_conditions !== "none"
            ? row.chronic_conditions.split(",").map(c => c.trim())
            : [],
        registration_date: row.registration_date
          ? new Date(row.registration_date)
          : null,
        insurance_type: row.insurance_type || null
      });
    })
    .on("end", async () => {
      try {
        if (patients.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            message: "No valid rows found in CSV"
          });
        }

        await Patient.insertMany(patients, {
          ordered: false
        });

        fs.unlinkSync(req.file.path);

        res.json({
          message: `Inserted ${patients.length} patients`
        });
      } catch (err) {
        console.error("CSV upload error:", err);
        res.status(500).json({ message: err.message });
      }
    });
});

module.exports = router;