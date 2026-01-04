import { useState } from 'react';
import axios from 'axios';
import { Upload, Stethoscope, AlertCircle } from 'lucide-react';

import { API_BASE } from "@/config/api";

const DEFAULT_DOCTORS = [
  { name: 'Dr. Sarah Johnson', speciality: 'Cardiology' },
  { name: 'Dr. Michael Chen', speciality: 'Internal Medicine' },
  { name: 'Dr. Emily Rodriguez', speciality: 'Pediatrics' },
  { name: 'Dr. David Kim', speciality: 'Orthopedics' },
  { name: 'Dr. Lisa Patel', speciality: 'Neurology' },
  { name: 'Dr. James Wilson', speciality: 'General Practice' },
];

export default function VisitSection() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const [formData, setFormData] = useState({
    visit_id: '',
    patient_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    severity_score: '',
    visit_type: '',
    length_of_stay: '',
    lab_result_glucose: '',
    lab_result_bp: '',
    previous_visit_gap_days: '',
    readmitted_within_30_days: '',
    visit_cost: '',
    doctor_name: '',
    doctor_speciality: '',
  });

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      setUploadMessage('Please select a CSV file');
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('file', csvFile);

    setUploadLoading(true);
    setUploadMessage('');

    try {
      const response = await axios.post(
        `${API_BASE}/api/visits/upload`,
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUploadMessage(`Success: ${response.data.message || 'Visits uploaded'}`);
      setCsvFile(null);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      setUploadMessage(
        `Error: ${error.response?.data?.message || error.message || 'Upload failed'}`
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage('');

    try {
      const payload = {
        ...formData,
        severity_score: parseInt(formData.severity_score),
        length_of_stay: parseInt(formData.length_of_stay),
        lab_result_glucose: parseFloat(formData.lab_result_glucose),
        previous_visit_gap_days: parseInt(formData.previous_visit_gap_days),
        visit_cost: parseFloat(formData.visit_cost),
      };

      const response = await axios.post(`${API_BASE}/api/visits/add`, payload);
      setFormMessage(`Success: ${response.data.message || 'Visit added'}`);
      setFormData({
        visit_id: '',
        patient_id: '',
        visit_date: new Date().toISOString().split('T')[0],
        severity_score: '',
        visit_type: '',
        length_of_stay: '',
        lab_result_glucose: '',
        lab_result_bp: '',
        previous_visit_gap_days: '',
        readmitted_within_30_days: '',
        visit_cost: '',
        doctor_name: '',
        doctor_speciality: '',
      });
    } catch (error: any) {
      setFormMessage(
        `Error: ${error.response?.data?.message || error.message || 'Failed to add visit'}`
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDoctorChange = (doctorName: string) => {
    const doctor = DEFAULT_DOCTORS.find((d) => d.name === doctorName);
    setFormData({
      ...formData,
      doctor_name: doctorName,
      doctor_speciality: doctor?.speciality || '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Stethoscope className="w-6 h-6" />
        Visit Management
      </h2>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Patient must exist before adding a Visit. Backend will validate patient_id.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border-r pr-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            CSV Upload
          </h3>
          <form onSubmit={handleCsvUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Visit CSV
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={uploadLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {uploadLoading ? 'Uploading...' : 'Upload Visits'}
            </button>
            {uploadMessage && (
              <p
                className={`text-sm ${
                  uploadMessage.startsWith('Success') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {uploadMessage}
              </p>
            )}
          </form>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Manual Entry</h3>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.visit_id}
                  onChange={(e) => setFormData({ ...formData, visit_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.visit_date}
                  onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Type *
                </label>
                <select
                  required
                  value={formData.visit_type}
                  onChange={(e) => setFormData({ ...formData, visit_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="OP">Outpatient (OP)</option>
                  <option value="IP">Inpatient (IP)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity Score (1-10) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={formData.severity_score}
                  onChange={(e) => setFormData({ ...formData, severity_score: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length of Stay (days) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.length_of_stay}
                  onChange={(e) => setFormData({ ...formData, length_of_stay: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lab Result - Glucose *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.lab_result_glucose}
                  onChange={(e) => setFormData({ ...formData, lab_result_glucose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lab Result - BP *
                </label>
                <input
                  type="text"
                  required
                  placeholder="120/80"
                  value={formData.lab_result_bp}
                  onChange={(e) => setFormData({ ...formData, lab_result_bp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Visit Gap (days) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.previous_visit_gap_days}
                  onChange={(e) => setFormData({ ...formData, previous_visit_gap_days: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Readmitted Within 30 Days *
                </label>
                <select
                  required
                  value={formData.readmitted_within_30_days}
                  onChange={(e) => setFormData({ ...formData, readmitted_within_30_days: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Cost *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.visit_cost}
                  onChange={(e) => setFormData({ ...formData, visit_cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name *
                </label>
                <select
                  required
                  value={formData.doctor_name}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  {DEFAULT_DOCTORS.map((doctor) => (
                    <option key={doctor.name} value={doctor.name}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Speciality *
              </label>
              <input
                type="text"
                required
                value={formData.doctor_speciality}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {formLoading ? 'Adding Visit...' : 'Add Visit'}
            </button>
            {formMessage && (
              <p
                className={`text-sm ${
                  formMessage.startsWith('Success') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
