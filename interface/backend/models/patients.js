const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  patient_id: String,
  age: Number,
  gender: String,
  location: String,
  bmi: Number,
  smoker_status: String,
  alcohol_use: String,
  chronic_conditions: [String],
  registration_date: Date,
  insurance_type: String
});

module.exports = mongoose.model("Patient", PatientSchema);
