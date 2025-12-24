import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    patient_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    full_name: {
      type: String,
      required: true,
      trim: true
    },

    age: {
      type: Number,
      min: 0,
      max: 120
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"]
    },

    blood_group: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },

    phone_number: {
      type: String,
      match: /^[6-9]\d{9}$/ // Indian phone number validation
    },

    email: {
      type: String,
      lowercase: true,
      trim: true
    },

    emergency_contact: {
      type: String,
      match: /^[6-9]\d{9}$/
    },

    hospital_location: {
      type: String,
      trim: true
    },

    bmi: {
      type: Number,
      min: 10,
      max: 60
    },

    smoker_status: {
      type: String,
      enum: ["Yes", "No"]
    },

    alcohol_use: {
      type: String,
      enum: ["Yes", "No"]
    },

    chronic_conditions: {
      type: String // e.g., Diabetes, Hypertension
    },

    registration_date: {
      type: Date
    },

    insurance_type: {
      type: String,
      enum: ["Government", "Private", "Corporate", "None"]
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Patient", patientSchema);
