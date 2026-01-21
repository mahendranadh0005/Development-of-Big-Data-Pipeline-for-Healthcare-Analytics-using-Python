const express = require("express");
const router = express.Router();

const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

const Visit = require("../models/Visit");

const upload = multer({ dest: "uploads/" });

/* ================= CSV UPLOAD ================= */
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No CSV file uploaded" });
  }

  const visits = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      // Required fields
      if (!row.visit_id || !row.patient_id) return;

      visits.push({
        visit_id: row.visit_id.trim(),
        patient_id: row.patient_id.trim(),

        visit_date:
          row.visit_date && row.visit_date !== ""
            ? new Date(row.visit_date)
            : new Date("1970-01-01"),

        severity_score:
          row.severity_score && row.severity_score !== ""
            ? parseInt(row.severity_score, 10)
            : 0,

        visit_type: row.visit_type?.trim() || "",

        length_of_stay:
          row.length_of_stay && row.length_of_stay !== ""
            ? parseInt(row.length_of_stay, 10)
            : 0,

        lab_result_glucose:
          row.lab_result_glucose && row.lab_result_glucose !== ""
            ? parseFloat(row.lab_result_glucose)
            : 0,

        lab_result_bp:
          row.lab_result_bp && row.lab_result_bp !== ""
            ? parseFloat(row.lab_result_bp)
            : 0,

        previous_visit_gap_days:
          row.previous_visit_gap_days && row.previous_visit_gap_days !== ""
            ? parseInt(row.previous_visit_gap_days, 10)
            : 0,

        readmitted_within_30_days:
          row.readmitted_within_30_days?.trim() || "",

        visit_cost:
          row.visit_cost && row.visit_cost !== ""
            ? parseFloat(row.visit_cost)
            : 0,

        doctor_name: row.doctor_name?.trim() || "",
        doctor_speciality: row.doctor_speciality?.trim() || ""
      });
    })
    .on("end", async () => {
      try {
        if (visits.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "CSV empty or invalid" });
        }

        await Visit.insertMany(visits, { ordered: false });
        fs.unlinkSync(req.file.path);

        res.json({
          message: `Inserted ${visits.length} visits`
        });
      } catch (err) {
        console.error("VISIT CSV INSERT ERROR:", err);
        res.status(500).json({ message: err.message });
      }
    })
    .on("error", (err) => {
      console.error("CSV PARSE ERROR:", err);
      res.status(500).json({ message: "Failed to parse CSV" });
    });
});

module.exports = router;
