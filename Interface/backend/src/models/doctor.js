import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    doctor_id: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    speciality: { type: String, required: true },
    department: { type: String },
    phone: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
