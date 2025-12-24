import Visit from "../models/Visit.js";
import { parseCSV } from "../utils/csvParser.js";

export const uploadVisits = async (req, res) => {
  const data = await parseCSV(req.file.path);
  await Visit.insertMany(data);
  res.json({ message: "Visits uploaded", count: data.length });
};

export const getVisits = async (req, res) => {
  res.json(await Visit.find());
};
