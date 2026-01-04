const mongoose = require("mongoose");

const VisitSchema = new mongoose.Schema({
  visit_id: String,
  patient_id: String,
  doctor_name: String,
  visit_date: String,
  diagnosis: String,
  visit_type: String,
});

module.exports = mongoose.model("Visit", VisitSchema);
