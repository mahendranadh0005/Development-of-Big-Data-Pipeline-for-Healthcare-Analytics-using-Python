import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import Papa from 'papaparse';
import { useApp } from '../context/AppContext';
import { Patient, Visit } from '../types';
import.meta.env.VITE_API_BASE_URL
const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface CSVUploadProps {
  onNavigate: (page: string) => void;
}

export default function CSVUpload({ onNavigate }: CSVUploadProps) {
  const { showToast } = useApp();

  const [uploadStatus, setUploadStatus] = useState({
    patients: { status: 'idle', message: '', count: 0 },
    visits: { status: 'idle', message: '', count: 0 },
  });

  const requiredPatientColumns = [
    'patient_id',
    'age',
    'gender',
    'location',
    'bmi',
    'smoker_status',
    'alcohol_use',
    'chronic_conditions',
    'registration_date',
    'insurance_type',
  ];

  const requiredVisitColumns = [
    'visit_id',
    'patient_id',
    'visit_date',
    'diagnosis_code',
    'diagnosis_description',
    'severity_score',
    'length_of_stay',
    'lab_result_glucose',
    'lab_result_bp',
    'previous_visit_gap_days',
    'readmitted_within_30_days',
    'visit_cost',
    'doctor_specialty',
  ];

  /* -------------------- PATIENT CSV -------------------- */

  const handlePatientsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const headers = results.meta.fields || [];
          const missing = requiredPatientColumns.filter(c => !headers.includes(c));

          if (missing.length) {
            showToast(`Missing columns: ${missing.join(', ')}`, 'error');
            return;
          }

          const patients: Patient[] = (results.data as any[]).map(row => ({
            patient_id: String(row.patient_id),
            age: Number(row.age),
            gender: row.gender,
            location: row.location,
            bmi: Number(row.bmi),
            smoker_status: row.smoker_status === 'yes' ? 'yes' : 'no',
            alcohol_use: row.alcohol_use === 'yes' ? 'yes' : 'no',
            chronic_conditions: row.chronic_conditions,
            registration_date: row.registration_date,
            insurance_type: row.insurance_type,
            full_name: row.full_name || row.patient_id,
            phone: row.phone || '',
            email: row.email || '',
            address: row.address || '',
            emergency_contact_name: row.emergency_contact_name || '',
            emergency_contact_phone: row.emergency_contact_phone || '',
          }));

        await fetch(`${API_BASE}/api/patients/bulk`,
           {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(patients),
            });


          setUploadStatus(prev => ({
            ...prev,
            patients: {
              status: 'success',
              message: 'Patients CSV saved to MongoDB',
              count: patients.length,
            },
          }));

          showToast(`Saved ${patients.length} patients to MongoDB`, 'success');
        } catch (err) {
          showToast('Failed to upload patients CSV', 'error');
        }
      },
    });

    e.target.value = '';
  };

  /* -------------------- VISITS CSV -------------------- */

  const handleVisitsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const headers = results.meta.fields || [];
          const missing = requiredVisitColumns.filter(c => !headers.includes(c));

          if (missing.length) {
            showToast(`Missing columns: ${missing.join(', ')}`, 'error');
            return;
          }

          const visits: Visit[] = (results.data as any[]).map(row => ({
            visit_id: row.visit_id,
            patient_id: row.patient_id,
            visit_date: row.visit_date,
            diagnosis_code: row.diagnosis_code,
            diagnosis_description: row.diagnosis_description,
            severity_score: Number(row.severity_score),
            length_of_stay: Number(row.length_of_stay),
            lab_result_glucose: Number(row.lab_result_glucose),
            lab_result_bp: row.lab_result_bp,
            previous_visit_gap_days: Number(row.previous_visit_gap_days),
            readmitted_within_30_days:
              row.readmitted_within_30_days === 'yes' ? 'yes' : 'no',
            visit_cost: Number(row.visit_cost),
            doctor_specialty: row.doctor_specialty,
          }));

          await fetch(`${API_BASE}/api/visits/bulk`,
             {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(visits),
              });

          setUploadStatus(prev => ({
            ...prev,
            visits: {
              status: 'success',
              message: 'Visits CSV saved to MongoDB',
              count: visits.length,
            },
          }));

          showToast(`Saved ${visits.length} visits to MongoDB`, 'success');
        } catch (err) {
          showToast('Failed to upload visits CSV', 'error');
        }
      },
    });

    e.target.value = '';
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">CSV Data Upload</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block bg-white p-6 rounded-xl shadow cursor-pointer">
          <FileText className="mb-2 text-blue-500" />
          <p>Upload patients.csv</p>
          <input type="file" accept=".csv" hidden onChange={handlePatientsUpload} />
        </label>

        <label className="block bg-white p-6 rounded-xl shadow cursor-pointer">
          <FileText className="mb-2 text-green-500" />
          <p>Upload visits.csv</p>
          <input type="file" accept=".csv" hidden onChange={handleVisitsUpload} />
        </label>
      </div>

      <button
        onClick={() => onNavigate('dashboard')}
        className="px-6 py-2 bg-gray-500 text-white rounded"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
