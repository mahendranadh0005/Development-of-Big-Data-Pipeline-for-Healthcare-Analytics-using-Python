import Patient from "../models/patient.js";
import { parseCSV } from "../utils/csvParser.js";

export const uploadPatients = async (req, res) => {
  const data = await parseCSV(req.file.path);
  await Patient.insertMany(data);
  res.json({ message: "Patients uploaded", count: data.length });
};

export const getPatients = async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
};
