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
      // STRICT FIELD MAPPING
      if (
        !row.patient_id ||
        !row.full_name ||
        !row.age ||
        !row.gender ||
        !row.blood_group ||
        !row.phone_number ||
        !row.email ||
        !row.emergency_contact ||
        !row.hospital_location ||
        !row.bmi ||
        !row.smoker_status ||
        !row.alcohol_use ||
        !row.insurance_type
      ) {
        return; // ❌ Skip invalid rows
      }

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
        chronic_conditions: [], // optional
        registration_date: new Date()
      });
    })
    .on("end", async () => {
      try {
        await Patient.insertMany(patients, {
          ordered: false,
          runValidators: true
        });

        fs.unlinkSync(req.file.path);
        res.json({
          message: `Inserted ${patients.length} valid patients`
        });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });
});
module.exports = router;