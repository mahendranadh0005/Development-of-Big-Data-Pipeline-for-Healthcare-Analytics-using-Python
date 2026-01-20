import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { Patient, Visit } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE}/api`;

interface AppContextType {
  patients: Patient[];
  visits: Visit[];
  addPatient: (patient: Patient) => Promise<void>;
  addVisit: (visit: Visit) => Promise<void>;
  getPatient: (patientId: string) => Patient | undefined;
  getPatientVisits: (patientId: string) => Visit[];
  uploadPatients: (patients: Patient[]) => Promise<void>;
  uploadVisits: (visits: Visit[]) => Promise<void>;
  searchPatients: (query: string) => Patient[];
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  /* ============================
     LOAD DATA FROM MONGODB
     ============================ */
  useEffect(() => {
    fetch(`${API_URL}/patients`)
      .then((res) => res.json())
      .then(setPatients)
      .catch(() => showToast('Failed to load patients', 'error'));

    fetch(`${API_URL}/visits`)
      .then((res) => res.json())
      .then(setVisits)
      .catch(() => showToast('Failed to load visits', 'error'));
  }, []);

  /* ============================
     ADD SINGLE PATIENT
     ============================ */
  const addPatient = async (patient: Patient) => {
    try {
      const res = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      });

      const saved = await res.json();
      setPatients((prev) => [...prev, saved]);
      showToast('Patient added successfully', 'success');
    } catch {
      showToast('Failed to add patient', 'error');
    }
  };

  /* ============================
     ADD SINGLE VISIT
     ============================ */
  const addVisit = async (visit: Visit) => {
    try {
      const res = await fetch(`${API_URL}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visit),
      });

      const saved = await res.json();
      setVisits((prev) => [...prev, saved]);
      showToast('Visit added successfully', 'success');
    } catch {
      showToast('Failed to add visit', 'error');
    }
  };

  /* ============================
     GETTERS (NO CHANGE)
     ============================ */
  const getPatient = (patientId: string) =>
    patients.find((p) => p.patient_id === patientId);

  const getPatientVisits = (patientId: string) =>
    visits
      .filter((v) => v.patient_id === patientId)
      .sort(
        (a, b) =>
          new Date(b.visit_date).getTime() -
          new Date(a.visit_date).getTime()
      );

  /* ============================
     BULK CSV UPLOADS
     ============================ */
  const uploadPatients = async (newPatients: Patient[]) => {
    try {
      await fetch(`${API_URL}/patients/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatients),
      });

      const res = await fetch(`${API_URL}/patients`);
      setPatients(await res.json());
      showToast('Patients CSV uploaded', 'success');
    } catch {
      showToast('Failed to upload patients CSV', 'error');
    }
  };

  const uploadVisits = async (newVisits: Visit[]) => {
    try {
      await fetch(`${API_URL}/visits/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVisits),
      });

      const res = await fetch(`${API_URL}/visits`);
      setVisits(await res.json());
      showToast('Visits CSV uploaded', 'success');
    } catch {
      showToast('Failed to upload visits CSV', 'error');
    }
  };

  /* ============================
     SEARCH (FRONTEND ONLY)
     ============================ */
  const searchPatients = (query: string) => {
    const q = query.toLowerCase();
    return patients.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.patient_id.toLowerCase().includes(q) ||
        p.phone.includes(query) ||
        p.email.toLowerCase().includes(q)
    );
  };

  /* ============================
     TOAST SYSTEM (UNCHANGED)
     ============================ */
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <AppContext.Provider
      value={{
        patients,
        visits,
        addPatient,
        addVisit,
        getPatient,
        getPatientVisits,
        uploadPatients,
        uploadVisits,
        searchPatients,
        showToast,
      }}
    >
      {children}

      {/* Toast UI */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg shadow-lg text-white animate-slide-in ${
              toast.type === 'success'
                ? 'bg-green-500'
                : toast.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};
