const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

const Patient = require("../models/Patient");

const upload = multer({ dest: "uploads/" });

/* ================= CSV UPLOAD ================= */
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No CSV uploaded" });
  }

  const patients = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      if (!row.patient_id || !row.full_name) return;

      patients.push({
        patient_id: row.patient_id.trim(),
        full_name: row.full_name.trim(),
        age: Number(row.age),
        gender: row.gender,
        blood_group: row.blood_group,
        phone_number: row.phone_number,
        email: row.email,
        emergency_contact: row.emergency_contact,
        hospital_location: row.hospital_location,
        bmi: Number(row.bmi),
        smoker_status: row.smoker_status,
        alcohol_use: row.alcohol_use,
        insurance_type: row.insurance_type,

        // ✅ FIXED: chronic_conditions (handles empty, missing, none, values)
        chronic_conditions:
          typeof row.chronic_conditions === "string" &&
          row.chronic_conditions.trim() !== "" &&
          row.chronic_conditions.trim().toLowerCase() !== "none"
            ? row.chronic_conditions
                .split(",")
                .map(c => c.trim())
                .filter(c => c.length > 0)
            : [],

        registration_date: new Date(row.registration_date)
      });
    })
    .on("end", async () => {
      try {
        await Patient.insertMany(patients, { ordered: false });
        fs.unlinkSync(req.file.path);
        res.json({ message: `Inserted ${patients.length} patients` });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    });
});

/* ================= MANUAL ADD ================= */
router.post("/add", async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ message: "Patient added", patient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
