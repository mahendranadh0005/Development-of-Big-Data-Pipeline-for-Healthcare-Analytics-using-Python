import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Visit } from '../types';

interface AddVisitProps {
  patientId: string;
  onNavigate: (page: string) => void;
}

export default function AddVisit({ patientId, onNavigate }: AddVisitProps) {
  const { getPatient, getPatientVisits, addVisit, showToast } = useApp();
  const patient = getPatient(patientId);
  const patientVisits = getPatientVisits(patientId);

  const [formData, setFormData] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    diagnosis_code: '',
    diagnosis_description: '',
    severity_score: '3',
    length_of_stay: '1',
    lab_result_glucose: '',
    lab_result_bp: '',
    readmitted_within_30_days: 'no' as 'yes' | 'no',
    visit_cost: '',
    doctor_specialty: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Patient not found</p>
        <button
          onClick={() => onNavigate('patients')}
          className="mt-4 text-blue-500 hover:text-blue-600"
        >
          Back to Patient List
        </button>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const calculatePreviousVisitGap = () => {
    if (patientVisits.length === 0) return 0;

    const lastVisit = patientVisits[0];
    const lastVisitDate = new Date(lastVisit.visit_date);
    const currentVisitDate = new Date(formData.visit_date);
    const diffTime = Math.abs(currentVisitDate.getTime() - lastVisitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.visit_date) newErrors.visit_date = 'Visit date is required';
    if (!formData.diagnosis_code.trim())
      newErrors.diagnosis_code = 'Diagnosis code is required';
    if (!formData.diagnosis_description.trim())
      newErrors.diagnosis_description = 'Diagnosis description is required';
    if (
      !formData.severity_score ||
      parseInt(formData.severity_score) < 1 ||
      parseInt(formData.severity_score) > 5
    )
      newErrors.severity_score = 'Severity score must be between 1 and 5';
    if (
      !formData.length_of_stay ||
      parseInt(formData.length_of_stay) < 0
    )
      newErrors.length_of_stay = 'Length of stay must be 0 or greater';
    if (!formData.lab_result_glucose || parseFloat(formData.lab_result_glucose) < 0)
      newErrors.lab_result_glucose = 'Valid glucose level is required';
    if (!formData.lab_result_bp.trim())
      newErrors.lab_result_bp = 'Blood pressure is required';
    if (!formData.visit_cost || parseFloat(formData.visit_cost) < 0)
      newErrors.visit_cost = 'Valid visit cost is required';
    if (!formData.doctor_specialty.trim())
      newErrors.doctor_specialty = 'Doctor specialty is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      const visit: Visit = {
        visit_id: `V${Date.now()}`,
        patient_id: patientId,
        visit_date: formData.visit_date,
        diagnosis_code: formData.diagnosis_code,
        diagnosis_description: formData.diagnosis_description,
        severity_score: parseInt(formData.severity_score),
        length_of_stay: parseInt(formData.length_of_stay),
        lab_result_glucose: parseFloat(formData.lab_result_glucose),
        lab_result_bp: formData.lab_result_bp,
        previous_visit_gap_days: calculatePreviousVisitGap(),
        readmitted_within_30_days: formData.readmitted_within_30_days,
        visit_cost: parseFloat(formData.visit_cost),
        doctor_specialty: formData.doctor_specialty,
      };

      addVisit(visit);
      showToast('Visit added successfully!', 'success');
      onNavigate(`patient-${patientId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => onNavigate(`patient-${patientId}`)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patient Profile
      </button>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Add Visit</h1>
          <p className="text-gray-600 mt-1">
            Recording visit for {patient.full_name} ({patient.patient_id})
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Date *
              </label>
              <input
                type="date"
                name="visit_date"
                value={formData.visit_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.visit_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.visit_date && (
                <p className="text-red-500 text-xs mt-1">{errors.visit_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis Code *
              </label>
              <input
                type="text"
                name="diagnosis_code"
                value={formData.diagnosis_code}
                onChange={handleChange}
                placeholder="e.g., ICD-10: I10"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.diagnosis_code ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.diagnosis_code && (
                <p className="text-red-500 text-xs mt-1">{errors.diagnosis_code}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis Description *
            </label>
            <input
              type="text"
              name="diagnosis_description"
              value={formData.diagnosis_description}
              onChange={handleChange}
              placeholder="e.g., Hypertension"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.diagnosis_description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.diagnosis_description && (
              <p className="text-red-500 text-xs mt-1">{errors.diagnosis_description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity Score (1-5) *
              </label>
              <select
                name="severity_score"
                value={formData.severity_score}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.severity_score ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="1">1 - Minimal</option>
                <option value="2">2 - Mild</option>
                <option value="3">3 - Moderate</option>
                <option value="4">4 - Severe</option>
                <option value="5">5 - Critical</option>
              </select>
              {errors.severity_score && (
                <p className="text-red-500 text-xs mt-1">{errors.severity_score}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length of Stay (days) *
              </label>
              <input
                type="number"
                name="length_of_stay"
                value={formData.length_of_stay}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.length_of_stay ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.length_of_stay && (
                <p className="text-red-500 text-xs mt-1">{errors.length_of_stay}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Glucose Level (mg/dL) *
              </label>
              <input
                type="number"
                step="0.1"
                name="lab_result_glucose"
                value={formData.lab_result_glucose}
                onChange={handleChange}
                placeholder="e.g., 95.5"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lab_result_glucose ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lab_result_glucose && (
                <p className="text-red-500 text-xs mt-1">{errors.lab_result_glucose}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Pressure *
              </label>
              <input
                type="text"
                name="lab_result_bp"
                value={formData.lab_result_bp}
                onChange={handleChange}
                placeholder="e.g., 120/80"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lab_result_bp ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lab_result_bp && (
                <p className="text-red-500 text-xs mt-1">{errors.lab_result_bp}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Cost ($) *
              </label>
              <input
                type="number"
                step="0.01"
                name="visit_cost"
                value={formData.visit_cost}
                onChange={handleChange}
                placeholder="e.g., 250.00"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.visit_cost ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.visit_cost && (
                <p className="text-red-500 text-xs mt-1">{errors.visit_cost}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Specialty *
              </label>
              <input
                type="text"
                name="doctor_specialty"
                value={formData.doctor_specialty}
                onChange={handleChange}
                placeholder="e.g., Cardiology"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.doctor_specialty ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.doctor_specialty && (
                <p className="text-red-500 text-xs mt-1">{errors.doctor_specialty}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Readmitted Within 30 Days *
            </label>
            <select
              name="readmitted_within_30_days"
              value={formData.readmitted_within_30_days}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Previous visit gap will be automatically calculated based on
              the last recorded visit.
              {patientVisits.length > 0 && (
                <span className="block mt-1">
                  Last visit: {new Date(patientVisits[0].visit_date).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => onNavigate(`patient-${patientId}`)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
