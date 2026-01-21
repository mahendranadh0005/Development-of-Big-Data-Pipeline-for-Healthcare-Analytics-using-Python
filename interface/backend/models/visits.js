const mongoose = require("mongoose");

const VisitSchema = new mongoose.Schema({
  visit_id: String,
  patient_id: String,
  visit_date: Date,
  diagnosis_code: String,
  diagnosis_description: String,
  severity_score: Number,
  length_of_stay: Number,
  lab_result_glucose: Number,
  lab_result_bp: String,
  previous_visit_gap_days: Number,
  readmitted_within_30_days: String,
  visit_cost: Number,
  doctor_specialty: String
});

module.exports = mongoose.model("Visit", VisitSchema);
