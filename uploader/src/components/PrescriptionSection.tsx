import { useState } from 'react';
import axios from 'axios';
import { Upload, Pill, AlertCircle } from 'lucide-react';

import { API_BASE } from "@/config/api";

const DEFAULT_DOCTORS = [
  'Dr. Sarah Johnson',
  'Dr. Michael Chen',
  'Dr. Emily Rodriguez',
  'Dr. David Kim',
  'Dr. Lisa Patel',
  'Dr. James Wilson',
];

export default function PrescriptionSection() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const [formData, setFormData] = useState({
    prescription_id: '',
    visit_id: '',
    patient_id: '',
    diagnosis_id: '',
    diagnosis_description: '',
    drug_name: '',
    dosage: '',
    quantity: '',
    days_supply: '',
    prescribed_date: new Date().toISOString().split('T')[0],
    cost: '',
    doctor_name: '',
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
        `${API_BASE}/api/prescriptions/upload`,
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUploadMessage(`Success: ${response.data.message || 'Prescriptions uploaded'}`);
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
        quantity: parseInt(formData.quantity),
        days_supply: parseInt(formData.days_supply),
        cost: parseFloat(formData.cost),
      };

      const response = await axios.post(`${API_BASE}/api/prescriptions/add`, payload);
      setFormMessage(`Success: ${response.data.message || 'Prescription added'}`);
      setFormData({
        prescription_id: '',
        visit_id: '',
        patient_id: '',
        diagnosis_id: '',
        diagnosis_description: '',
        drug_name: '',
        dosage: '',
        quantity: '',
        days_supply: '',
        prescribed_date: new Date().toISOString().split('T')[0],
        cost: '',
        doctor_name: '',
      });
    } catch (error: any) {
      setFormMessage(
        `Error: ${error.response?.data?.message || error.message || 'Failed to add prescription'}`
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Pill className="w-6 h-6" />
        Prescription Management
      </h2>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Visit must exist before adding a Prescription. Backend will validate visit_id and patient_id.
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
                Upload Prescription CSV
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
              {uploadLoading ? 'Uploading...' : 'Upload Prescriptions'}
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
                  Prescription ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prescription_id}
                  onChange={(e) => setFormData({ ...formData, prescription_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.diagnosis_id}
                  onChange={(e) => setFormData({ ...formData, diagnosis_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis Description *
              </label>
              <textarea
                required
                rows={2}
                value={formData.diagnosis_description}
                onChange={(e) => setFormData({ ...formData, diagnosis_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drug Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.drug_name}
                  onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 500mg"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Days Supply *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.days_supply}
                  onChange={(e) => setFormData({ ...formData, days_supply: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescribed Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.prescribed_date}
                  onChange={(e) => setFormData({ ...formData, prescribed_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name *
              </label>
              <select
                required
                value={formData.doctor_name}
                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                {DEFAULT_DOCTORS.map((doctor) => (
                  <option key={doctor} value={doctor}>
                    {doctor}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {formLoading ? 'Adding Prescription...' : 'Add Prescription'}
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
