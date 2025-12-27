import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["admin", "doctor"] }
});

export default mongoose.model("User", userSchema);
