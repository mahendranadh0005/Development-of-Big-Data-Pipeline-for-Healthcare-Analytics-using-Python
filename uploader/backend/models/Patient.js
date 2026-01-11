const PatientSchema = new mongoose.Schema({
  patient_id: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  blood_group: { type: String, required: true },
  phone_number: { type: String, required: true },
  email: { type: String, required: true },
  emergency_contact: { type: String, required: true },
  hospital_location: { type: String, required: true },
  bmi: { type: Number, required: true },
  smoker_status: { type: String, required: true },
  alcohol_use: { type: String, required: true },
  insurance_type: { type: String, required: true },
  chronic_conditions: { type: [String], default: [] },
  registration_date: { type: Date, default: Date.now }
}, { strict: true });
