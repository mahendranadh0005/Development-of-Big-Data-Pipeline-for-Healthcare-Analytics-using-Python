import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import User from "./models/user.js";
import connectDB from "./config/db.js";

const seedAdmin = async () => {
  await connectDB();

  const adminExists = await User.findOne({ username: "hospitaladmin" });
  if (adminExists) {
    console.log("Admin already exists");
    process.exit();
  }

  const admin = new User({
    username: "admin",
    password: await bcrypt.hash("admin123", 10),
    role: "hospital", // ✅ FIXED
  });

  await admin.save();
  console.log("✅ Hospital Admin Created");
  process.exit();
};

seedAdmin();
