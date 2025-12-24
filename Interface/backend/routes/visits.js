const express = require("express");
const Visit = require("../models/visits");
const router = express.Router();

router.post("/", async (req, res) => {
  const visit = new Visit(req.body);
  await visit.save();
  res.json(visit);
});
router.post("/bulk", async (req, res) => {
  try {
    const visits = req.body;

    if (!Array.isArray(visits)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    await Visit.insertMany(visits, { ordered: false });

    res.json({ message: "Visits CSV saved to MongoDB" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save visits CSV" });
  }
});


router.get("/", async (req, res) => {
  try {
    const visits = await Visit.find();
    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch visits" });
  }
});


module.exports = router;
