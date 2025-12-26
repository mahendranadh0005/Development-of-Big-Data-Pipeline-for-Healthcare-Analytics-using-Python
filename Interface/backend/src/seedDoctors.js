import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import Doctor from "./models/doctor.js";

const seedDoctors = async () => {
  await connectDB();

  await Doctor.deleteMany();

  await Doctor.insertMany([
    {
      doctor_id: "DOC001",
      full_name: "Dr. Anil Kumar",
      speciality: "Cardiology",
      department: "Heart",
      phone: "9999999999",
      email: "anil@hospital.com",
    },
  ]);

  console.log("✅ Doctors seeded");
  process.exit();
};

seedDoctors();
