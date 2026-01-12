const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema({
  prescription_id: { type: String, unique: true, required: true },

  visit_id: { type: String, required: true },
  patient_id: { type: String, required: true },

  diagnosis_id: String,
  diagnosis_description: String,

  drug_name: String,
  dosage: String,

  quantity: Number,
  days_supply: Number,

  prescribed_date: Date,
  cost: Number,

  doctor_name: String
}, { strict: true });

module.exports = mongoose.model("Prescription", PrescriptionSchema);
