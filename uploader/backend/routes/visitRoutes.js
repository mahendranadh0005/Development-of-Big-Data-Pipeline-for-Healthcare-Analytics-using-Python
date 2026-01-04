const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

const Visit = require("../models/Visit");

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), (req, res) => {
  const visits = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      visits.push({
        visit_id: row.visit_id?.trim(),
        patient_id: row.patient_id?.trim(),
        visit_date: row.visit_date,
        doctor_name: row.doctor_name,
      });
    })
    .on("end", async () => {
      await Visit.insertMany(visits);
      fs.unlinkSync(req.file.path);
      res.json({ message: "Visits CSV uploaded successfully" });
    });
});

module.exports = router;
