import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "@/services/api";
import { Patient, Visit, Prescription, Doctor } from "@/types/hospital";

/* =======================
   CONTEXT TYPE
======================= */

interface DataContextType {
  patients: Patient[];
  visits: Visit[];
  prescriptions: Prescription[];
  doctors: Doctor[];
  loading: boolean;

  /* REFRESH */
  refreshPatients: () => Promise<void>;
  refreshVisits: () => Promise<void>;
  refreshPrescriptions: () => Promise<void>;
  refreshDoctors: () => Promise<void>;

  /* CSV UPLOAD */
  uploadPatientsCSV: (file: File) => Promise<void>;
  uploadVisitsCSV: (file: File) => Promise<void>;
  uploadPrescriptionsCSV: (file: File) => Promise<void>;

  /* BULK (USED BY CSV MODALS) */
  bulkAddPatients: (data: Patient[]) => { success: number; errors: string[] };
  bulkAddVisits: (data: Visit[]) => { success: number; errors: string[] };
  bulkAddPrescriptions: (data: Prescription[]) => {
    success: number;
    errors: string[];
  };

  /* HELPERS */
  getVisitsByPatient: (patientId: string) => Visit[];
  getVisitsByDoctor: (doctorName: string) => Visit[];
  getPrescriptionsByDoctor: (doctorName: string) => Prescription[];
  getPatientsByDoctor: (doctorName: string) => Patient[];

  /* SINGLE ADD */
  addPrescription: (
    prescription: Prescription
  ) => { success: boolean; error?: string };

  /* ID GENERATORS */
  generatePatientId: () => string;
  generateVisitId: () => string;
  generatePrescriptionId: () => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/* =======================
   PROVIDER
======================= */

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  /* =======================
     FETCH FROM BACKEND
  ======================= */

  const refreshPatients = useCallback(async () => {
    const res = await api.get("/patients");
    setPatients(res.data);
  }, []);

  const refreshVisits = useCallback(async () => {
    const res = await api.get("/visits");
    setVisits(res.data);
  }, []);

  const refreshPrescriptions = useCallback(async () => {
    const res = await api.get("/prescriptions");
    setPrescriptions(res.data);
  }, []);

  const refreshDoctors = useCallback(async () => {
    const res = await api.get("/doctors");
    setDoctors(res.data);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      refreshPatients(),
      refreshVisits(),
      refreshPrescriptions(),
      refreshDoctors(),
    ]).finally(() => setLoading(false));
  }, [
    refreshPatients,
    refreshVisits,
    refreshPrescriptions,
    refreshDoctors,
  ]);

  /* =======================
     CSV UPLOAD (BACKEND)
  ======================= */

  const uploadPatientsCSV = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    await api.post("/patients/upload", fd);
    await refreshPatients();
  };

  const uploadVisitsCSV = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    await api.post("/visits/upload", fd);
    await refreshVisits();
  };

  const uploadPrescriptionsCSV = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    await api.post("/prescriptions/upload", fd);
    await refreshPrescriptions();
  };

  /* =======================
     BULK ADD (UI CSV)
  ======================= */

  const bulkAddPatients = (data: Patient[]) => {
    setPatients((prev) => [...prev, ...data]);
    return { success: data.length, errors: [] };
  };

  const bulkAddVisits = (data: Visit[]) => {
    setVisits((prev) => [...prev, ...data]);
    return { success: data.length, errors: [] };
  };

  const bulkAddPrescriptions = (data: Prescription[]) => {
    setPrescriptions((prev) => [...prev, ...data]);
    return { success: data.length, errors: [] };
  };

  /* =======================
     HELPERS
  ======================= */

  const getVisitsByPatient = (patientId: string) =>
    visits.filter((v) => v.patient_id === patientId);

  const getVisitsByDoctor = (doctorName: string) =>
    visits.filter((v) => v.doctor_name === doctorName);

  const getPrescriptionsByDoctor = (doctorName: string) =>
    prescriptions.filter((p) => p.doctor_name === doctorName);

  const getPatientsByDoctor = (doctorName: string) => {
    const ids = new Set(
      visits
        .filter((v) => v.doctor_name === doctorName)
        .map((v) => v.patient_id)
    );
    return patients.filter((p) => ids.has(p.patient_id));
  };

  const addPrescription = (prescription: Prescription) => {
    setPrescriptions((prev) => [...prev, prescription]);
    return { success: true };
  };

  /* =======================
     ID GENERATORS (SAFE)
  ======================= */

  const generatePatientId = () =>
    `PAT${String(patients.length + 1).padStart(3, "0")}`;

  const generateVisitId = () =>
    `VIS${String(visits.length + 1).padStart(3, "0")}`;

  const generatePrescriptionId = () =>
    `PRE${String(prescriptions.length + 1).padStart(3, "0")}`;

  return (
    <DataContext.Provider
      value={{
        patients,
        visits,
        prescriptions,
        doctors,
        loading,
        refreshPatients,
        refreshVisits,
        refreshPrescriptions,
        refreshDoctors,
        uploadPatientsCSV,
        uploadVisitsCSV,
        uploadPrescriptionsCSV,
        bulkAddPatients,
        bulkAddVisits,
        bulkAddPrescriptions,
        getVisitsByPatient,
        getVisitsByDoctor,
        getPrescriptionsByDoctor,
        getPatientsByDoctor,
        addPrescription,
        generatePatientId,
        generateVisitId,
        generatePrescriptionId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

/* =======================
   HOOK
======================= */

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
