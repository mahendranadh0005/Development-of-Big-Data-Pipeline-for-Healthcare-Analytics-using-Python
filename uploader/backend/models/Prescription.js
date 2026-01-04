const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema({
  prescription_id: String,
  visit_id: String,
  patient_id: String,
  drug_name: String,
  dosage: String,
  quantity: Number,
  days_supply: Number,
  prescribed_date: String,
});

module.exports = mongoose.model("Prescription", PrescriptionSchema);
