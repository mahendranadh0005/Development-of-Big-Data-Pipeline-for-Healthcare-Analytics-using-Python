const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

const Patient = require("../models/Patient");

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No CSV uploaded" });
  }

  const patients = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      patients.push({
        patient_id: row.patient_id?.trim(),
        name: row.name,
        age: Number(row.age),
        gender: row.gender,
      });
    })
    .on("end", async () => {
      try {
        await Patient.insertMany(patients);
        fs.unlinkSync(req.file.path);
        res.json({ message: "Patients CSV uploaded successfully" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });
});

module.exports = router;
