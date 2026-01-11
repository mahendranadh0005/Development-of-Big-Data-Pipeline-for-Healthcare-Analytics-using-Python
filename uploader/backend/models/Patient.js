const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  patient_id: { type: String, required: true, unique: true },
  full_name: String,
  age: Number,
  gender: String,
  blood_group: String,
  phone_number: String,
  email: String,
  emergency_contact: String,
  hospital_location: String,
  bmi: Number,
  smoker_status: String,
  alcohol_use: String,
  chronic_conditions: [String],
  registration_date: Date,
  insurance_type: String
}, { strict: true });

module.exports = mongoose.model("Patient", PatientSchema);