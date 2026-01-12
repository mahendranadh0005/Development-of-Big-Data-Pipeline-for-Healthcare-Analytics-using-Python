const express = require("express");
const Patient = require("../models/patients");
const router = express.Router();

router.post("/", async (req, res) => {
  const patient = new Patient(req.body);
  await patient.save();
  res.json(patient);
});

router.post("/bulk", async (req, res) => {
  try {
    const patients = req.body;

    if (!Array.isArray(patients)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    await Patient.insertMany(patients, { ordered: false });

    res.json({ message: "Patients CSV saved to MongoDB" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save patients CSV" });
  }
});

router.get("/", async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

module.exports = router;
