import React, { createContext, useContext, useState, useCallback } from 'react';
import { Patient, Visit, Doctor, Prescription } from '@/types/hospital';

interface DataContextType {
  patients: Patient[];
  visits: Visit[];
  doctors: Doctor[];
  prescriptions: Prescription[];
  addPatient: (patient: Patient) => { success: boolean; error?: string };
  addVisit: (visit: Visit) => { success: boolean; error?: string };
  addDoctor: (doctor: Doctor) => { success: boolean; error?: string };
  addPrescription: (prescription: Prescription) => { success: boolean; error?: string };
  bulkAddPatients: (patients: Patient[]) => { success: number; errors: string[] };
  bulkAddVisits: (visits: Visit[]) => { success: number; errors: string[] };
  bulkAddPrescriptions: (prescriptions: Prescription[]) => { success: number; errors: string[] };
  getPatientById: (id: string) => Patient | undefined;
  getVisitsByPatient: (patientId: string) => Visit[];
  getVisitsByDoctor: (doctorName: string) => Visit[];
  getPrescriptionsByDoctor: (doctorName: string) => Prescription[];
  getPatientsByDoctor: (doctorName: string) => Patient[];
  generatePatientId: () => string;
  generateVisitId: () => string;
  generatePrescriptionId: () => string;
  isPatientIdUnique: (id: string) => boolean;
  isVisitIdUnique: (id: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial demo data
const INITIAL_DOCTORS: Doctor[] = [
  { doctor_name: 'Dr. Sarah Chen', user_id: 'dr_cardiology', password: 'doctor123', doctor_speciality: 'Cardiology' },
  { doctor_name: 'Dr. Michael Roberts', user_id: 'dr_neuro', password: 'doctor123', doctor_speciality: 'Neurology' },
];

const INITIAL_PATIENTS: Patient[] = [
  {
    patient_id: 'PAT001',
    full_name: 'John Smith',
    age: 45,
    gender: 'Male',
    blood_group: 'O+',
    phone_number: '555-0101',
    email: 'john.smith@email.com',
    emergency_contact: '555-0102',
    hospital_location: 'Main Campus',
    bmi: 24.5,
    smoker_status: 'No',
    alcohol_use: 'No',
    chronic_conditions: ['Hypertension'],
    registration_date: '2024-01-15',
    insurance_type: 'Premium Health'
  },
  {
    patient_id: 'PAT002',
    full_name: 'Emily Johnson',
    age: 32,
    gender: 'Female',
    blood_group: 'A+',
    phone_number: '555-0201',
    email: 'emily.j@email.com',
    emergency_contact: '555-0202',
    hospital_location: 'Downtown Branch',
    bmi: 22.1,
    smoker_status: 'No',
    alcohol_use: 'Yes',
    chronic_conditions: ['Asthma'],
    registration_date: '2024-02-20',
    insurance_type: 'Basic Care'
  },
  {
    patient_id: 'PAT003',
    full_name: 'Robert Davis',
    age: 58,
    gender: 'Male',
    blood_group: 'B+',
    phone_number: '555-0301',
    email: 'robert.d@email.com',
    emergency_contact: '555-0302',
    hospital_location: 'Main Campus',
    bmi: 28.3,
    smoker_status: 'Yes',
    alcohol_use: 'Yes',
    chronic_conditions: ['Diabetes', 'Heart Disease'],
    registration_date: '2024-01-08',
    insurance_type: 'Comprehensive Plus'
  }
];

const INITIAL_VISITS: Visit[] = [
  {
    visit_id: 'VIS001',
    patient_id: 'PAT001',
    visit_date: '2024-03-01',
    severity_score: 2,
    visit_type: 'OP',
    length_of_stay: 0,
    lab_result_glucose: 105,
    lab_result_bp: '130/85',
    previous_visit_gap_days: 0,
    readmitted_within_30_days: 'N/A',
    visit_cost: 250,
    doctor_name: 'Dr. Sarah Chen',
    doctor_speciality: 'Cardiology'
  },
  {
    visit_id: 'VIS002',
    patient_id: 'PAT001',
    visit_date: '2024-03-15',
    severity_score: 3,
    visit_type: 'OP',
    length_of_stay: 0,
    lab_result_glucose: 115,
    lab_result_bp: '140/90',
    previous_visit_gap_days: 14,
    readmitted_within_30_days: 'N/A',
    visit_cost: 300,
    doctor_name: 'Dr. Sarah Chen',
    doctor_speciality: 'Cardiology'
  },
  {
    visit_id: 'VIS003',
    patient_id: 'PAT002',
    visit_date: '2024-03-10',
    severity_score: 1,
    visit_type: 'OP',
    length_of_stay: 0,
    lab_result_glucose: 95,
    lab_result_bp: '120/80',
    previous_visit_gap_days: 0,
    readmitted_within_30_days: 'N/A',
    visit_cost: 200,
    doctor_name: 'Dr. Michael Roberts',
    doctor_speciality: 'Neurology'
  },
  {
    visit_id: 'VIS004',
    patient_id: 'PAT003',
    visit_date: '2024-02-28',
    severity_score: 4,
    visit_type: 'IP',
    length_of_stay: 3,
    lab_result_glucose: 180,
    lab_result_bp: '150/95',
    previous_visit_gap_days: 0,
    readmitted_within_30_days: 'No',
    visit_cost: 1500,
    doctor_name: 'Dr. Sarah Chen',
    doctor_speciality: 'Cardiology'
  },
  {
    visit_id: 'VIS005',
    patient_id: 'PAT003',
    visit_date: '2024-03-20',
    severity_score: 3,
    visit_type: 'OP',
    length_of_stay: 0,
    lab_result_glucose: 150,
    lab_result_bp: '145/90',
    previous_visit_gap_days: 21,
    readmitted_within_30_days: 'N/A',
    visit_cost: 350,
    doctor_name: 'Dr. Sarah Chen',
    doctor_speciality: 'Cardiology'
  }
];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    prescription_id: 'PRE001',
    visit_id: 'VIS001',
    patient_id: 'PAT001',
    diagnosis_id: 'DX001',
    diagnosis_description: 'Essential Hypertension',
    drug_name: 'Lisinopril',
    dosage: '10mg',
    quantity: 30,
    days_supply: 30,
    prescribed_date: '2024-03-01',
    drug_category: 'Cardiovascular',
    cost: 45.00,
    doctor_name: 'Dr. Sarah Chen'
  },
  {
    prescription_id: 'PRE002',
    visit_id: 'VIS003',
    patient_id: 'PAT002',
    diagnosis_id: 'DX002',
    diagnosis_description: 'Migraine without aura',
    drug_name: 'Sumatriptan',
    dosage: '50mg',
    quantity: 9,
    days_supply: 30,
    prescribed_date: '2024-03-10',
    drug_category: 'Neurological',
    cost: 120.00,
    doctor_name: 'Dr. Michael Roberts'
  }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [visits, setVisits] = useState<Visit[]>(INITIAL_VISITS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);

  const isPatientIdUnique = useCallback((id: string) => {
    return !patients.some(p => p.patient_id === id);
  }, [patients]);

  const isVisitIdUnique = useCallback((id: string) => {
    return !visits.some(v => v.visit_id === id);
  }, [visits]);

  const generatePatientId = useCallback(() => {
    const maxNum = patients.reduce((max, p) => {
      const num = parseInt(p.patient_id.replace('PAT', ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return `PAT${String(maxNum + 1).padStart(3, '0')}`;
  }, [patients]);

  const generateVisitId = useCallback(() => {
    const maxNum = visits.reduce((max, v) => {
      const num = parseInt(v.visit_id.replace('VIS', ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return `VIS${String(maxNum + 1).padStart(3, '0')}`;
  }, [visits]);

  const generatePrescriptionId = useCallback(() => {
    const maxNum = prescriptions.reduce((max, p) => {
      const num = parseInt(p.prescription_id.replace('PRE', ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return `PRE${String(maxNum + 1).padStart(3, '0')}`;
  }, [prescriptions]);

  const addPatient = useCallback((patient: Patient) => {
    if (!isPatientIdUnique(patient.patient_id)) {
      return { success: false, error: 'Patient ID already exists' };
    }
    setPatients(prev => [...prev, patient]);
    return { success: true };
  }, [isPatientIdUnique]);

  const addVisit = useCallback((visit: Visit) => {
    if (!isVisitIdUnique(visit.visit_id)) {
      return { success: false, error: 'Visit ID already exists' };
    }
    if (!patients.some(p => p.patient_id === visit.patient_id)) {
      return { success: false, error: 'Patient not found' };
    }
    setVisits(prev => [...prev, visit]);
    return { success: true };
  }, [isVisitIdUnique, patients]);

  const addDoctor = useCallback((doctor: Doctor) => {
    if (doctors.some(d => d.user_id === doctor.user_id)) {
      return { success: false, error: 'Doctor User ID already exists' };
    }
    setDoctors(prev => [...prev, doctor]);
    // Add to auth system
    (window as any).__addDynamicDoctor?.({
      userId: doctor.user_id,
      password: doctor.password,
      role: 'doctor' as const,
      name: doctor.doctor_name,
      speciality: doctor.doctor_speciality
    });
    return { success: true };
  }, [doctors]);

  const addPrescription = useCallback((prescription: Prescription) => {
    setPrescriptions(prev => [...prev, prescription]);
    return { success: true };
  }, []);

  const bulkAddPatients = useCallback((newPatients: Patient[]) => {
    let successCount = 0;
    const errors: string[] = [];
    const validPatients: Patient[] = [];

    newPatients.forEach((patient, index) => {
      if (!isPatientIdUnique(patient.patient_id) && !validPatients.some(p => p.patient_id === patient.patient_id)) {
        errors.push(`Row ${index + 1}: Patient ID ${patient.patient_id} already exists`);
      } else {
        validPatients.push(patient);
        successCount++;
      }
    });

    if (validPatients.length > 0) {
      setPatients(prev => [...prev, ...validPatients]);
    }

    return { success: successCount, errors };
  }, [isPatientIdUnique]);

  const bulkAddVisits = useCallback((newVisits: Visit[]) => {
    let successCount = 0;
    const errors: string[] = [];
    const validVisits: Visit[] = [];

    newVisits.forEach((visit, index) => {
      if (!isVisitIdUnique(visit.visit_id) && !validVisits.some(v => v.visit_id === visit.visit_id)) {
        errors.push(`Row ${index + 1}: Visit ID ${visit.visit_id} already exists`);
      } else if (!patients.some(p => p.patient_id === visit.patient_id)) {
        errors.push(`Row ${index + 1}: Patient ID ${visit.patient_id} not found`);
      } else {
        validVisits.push(visit);
        successCount++;
      }
    });

    if (validVisits.length > 0) {
      setVisits(prev => [...prev, ...validVisits]);
    }

    return { success: successCount, errors };
  }, [isVisitIdUnique, patients]);

  const bulkAddPrescriptions = useCallback((newPrescriptions: Prescription[]) => {
    const successCount = newPrescriptions.length;
    const errors: string[] = [];

    if (newPrescriptions.length > 0) {
      setPrescriptions(prev => [...prev, ...newPrescriptions]);
    }

    return { success: successCount, errors };
  }, []);

  const getPatientById = useCallback((id: string) => {
    return patients.find(p => p.patient_id === id);
  }, [patients]);

  const getVisitsByPatient = useCallback((patientId: string) => {
    return visits.filter(v => v.patient_id === patientId);
  }, [visits]);

  const getVisitsByDoctor = useCallback((doctorName: string) => {
    return visits.filter(v => v.doctor_name === doctorName);
  }, [visits]);

  const getPrescriptionsByDoctor = useCallback((doctorName: string) => {
    return prescriptions.filter(p => p.doctor_name === doctorName);
  }, [prescriptions]);

  const getPatientsByDoctor = useCallback((doctorName: string) => {
    const patientIds = new Set(visits.filter(v => v.doctor_name === doctorName).map(v => v.patient_id));
    return patients.filter(p => patientIds.has(p.patient_id));
  }, [visits, patients]);

  return (
    <DataContext.Provider value={{
      patients,
      visits,
      doctors,
      prescriptions,
      addPatient,
      addVisit,
      addDoctor,
      addPrescription,
      bulkAddPatients,
      bulkAddVisits,
      bulkAddPrescriptions,
      getPatientById,
      getVisitsByPatient,
      getVisitsByDoctor,
      getPrescriptionsByDoctor,
      getPatientsByDoctor,
      generatePatientId,
      generateVisitId,
      generatePrescriptionId,
      isPatientIdUnique,
      isVisitIdUnique
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
