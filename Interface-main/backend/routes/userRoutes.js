const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
});

// model (IMPORTANT: name must be "User")
const User = mongoose.model("User", UserSchema);

// ✅ GET http://localhost:5000/api/users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ✅ POST http://localhost:5000/api/users
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: "User saved", user });
  } catch (err) {
    res.status(500).json({ message: "Error saving user" });
  }
});

module.exports = router;
