import { useState } from 'react';
import axios from 'axios';
import { Upload, UserPlus } from 'lucide-react';

import { API_BASE } from "@/config/api";

const CHRONIC_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Asthma',
  'COPD',
  'Kidney Disease',
  'Cancer',
  'Arthritis',
];

export default function PatientSection() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const [formData, setFormData] = useState({
    patient_id: '',
    full_name: '',
    age: '',
    gender: '',
    blood_group: '',
    phone_number: '',
    email: '',
    emergency_contact: '',
    hospital_location: '',
    bmi: '',
    smoker_status: '',
    alcohol_use: '',
    chronic_conditions: [] as string[],
    registration_date: new Date().toISOString().split('T')[0],
    insurance_type: '',
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
        `${API_BASE}/api/patients/upload`,
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUploadMessage(`Success: ${response.data.message || 'Patients uploaded'}`);
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
        age: parseInt(formData.age),
        bmi: parseFloat(formData.bmi),
      };

      const response = await axios.post(
        `${API_BASE}/api/patients/add`,
        payload
      );
      setFormMessage(`Success: ${response.data.message || 'Patient added'}`);
      setFormData({
        patient_id: '',
        full_name: '',
        age: '',
        gender: '',
        blood_group: '',
        phone_number: '',
        email: '',
        emergency_contact: '',
        hospital_location: '',
        bmi: '',
        smoker_status: '',
        alcohol_use: '',
        chronic_conditions: [],
        registration_date: new Date().toISOString().split('T')[0],
        insurance_type: '',
      });
    } catch (error: any) {
      setFormMessage(
        `Error: ${error.response?.data?.message || error.message || 'Failed to add patient'}`
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleCheckboxChange = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions.includes(condition)
        ? prev.chronic_conditions.filter((c) => c !== condition)
        : [...prev.chronic_conditions, condition],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <UserPlus className="w-6 h-6" />
        Patient Management
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border-r pr-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            CSV Upload
          </h3>
          <form onSubmit={handleCsvUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Patient CSV
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
              {uploadLoading ? 'Uploading...' : 'Upload Patients'}
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  required
                  max="199"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group *
                </label>
                <select
                  required
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BMI *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.bmi}
                  onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1234567890"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1234567890"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hospital_location}
                  onChange={(e) => setFormData({ ...formData, hospital_location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Smoker *</label>
                <select
                  required
                  value={formData.smoker_status}
                  onChange={(e) => setFormData({ ...formData, smoker_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alcohol Use *
                </label>
                <select
                  required
                  value={formData.alcohol_use}
                  onChange={(e) => setFormData({ ...formData, alcohol_use: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chronic Conditions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CHRONIC_CONDITIONS.map((condition) => (
                  <label key={condition} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.chronic_conditions.includes(condition)}
                      onChange={() => handleCheckboxChange(condition)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.registration_date}
                  onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Type *
                </label>
                <select
                  required
                  value={formData.insurance_type}
                  onChange={(e) => setFormData({ ...formData, insurance_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Private">Private</option>
                  <option value="Medicare">Medicare</option>
                  <option value="Medicaid">Medicaid</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {formLoading ? 'Adding Patient...' : 'Add Patient'}
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
