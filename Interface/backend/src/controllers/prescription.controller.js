import Prescription from "../models/prescription.js";
import { parseCSV } from "../utils/csvParser.js";

export const uploadPrescriptions = async (req, res) => {
  const data = await parseCSV(req.file.path);
  await Prescription.insertMany(data);
  res.json({ message: "Prescriptions uploaded", count: data.length });
};

export const getPrescriptions = async (req, res) => {
  res.json(await Prescription.find());
};
