import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    visit_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    patient_id: {
      type: String,
      required: true,
      index: true
    },

    visit_date: {
      type: Date,
      required: true
    },

    severity_score: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    visit_type: {
      type: String,
      enum: ["IP", "OP", "ER"], // Inpatient, Outpatient, Emergency
      required: true
    },

    length_of_stay: {
      type: Number,
      min: 0 // OP visits may be 0
    },

    lab_result_glucose: {
      type: Number,
      min: 40,
      max: 600
    },

    lab_result_bp: {
      type: String // e.g. "136/82"
    },

    previous_visit_gap_days: {
      type: Number,
      min: 0
    },

    readmitted_within_30_days: {
      type: String,
      enum: ["Yes", "No"],
      index: true
    },

    visit_cost: {
      type: Number,
      min: 0
    },

    doctor_name: {
      type: String,
      trim: true
    },

    doctor_speciality: {
      type: String,
      trim: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Visit", visitSchema);
