import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    prescription_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    visit_id: {
      type: String,
      required: true,
      index: true
    },

    patient_id: {
      type: String,
      required: true,
      index: true
    },

    diagnosis_id: {
      type: String,
      required: true,
      index: true
    },

    diagnosis_description: {
      type: String,
      required: true,
      trim: true
    },

    drug_name: {
      type: String,
      required: true,
      trim: true
    },

    dosage: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    days_supply: {
      type: Number,
      required: true,
      min: 1
    },

    prescribed_date: {
      type: Date,
      required: true
    },

    drug_category: {
      type: String,
      trim: true,
      index: true
    },

    cost: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Prescription", prescriptionSchema);
