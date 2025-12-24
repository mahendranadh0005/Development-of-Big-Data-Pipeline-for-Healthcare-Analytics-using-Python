import { useState } from 'react';
import { ArrowLeft, ArrowRight, Save, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PatientFormData, Patient } from '../types';

interface AddPatientProps {
  onNavigate: (page: string) => void;
}

export default function AddPatient({ onNavigate }: AddPatientProps) {
  const { addPatient, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PatientFormData>({
    full_name: '',
    age: '',
    gender: 'male',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    location: '',
    bmi: '',
    smoker_status: 'no',
    alcohol_use: 'no',
    chronic_conditions: [],
    insurance_type: 'self-pay',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleConditionToggle = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions.includes(condition)
        ? prev.chronic_conditions.filter((c) => c !== condition)
        : [...prev.chronic_conditions, condition],
    }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Name is required';
    if (!formData.age || parseInt(formData.age) < 0 || parseInt(formData.age) > 150)
      newErrors.age = 'Valid age is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.email.trim() || !formData.email.includes('@'))
      newErrors.email = 'Valid email is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.emergency_contact_name.trim())
      newErrors.emergency_contact_name = 'Emergency contact name is required';
    if (!formData.emergency_contact_phone.trim())
      newErrors.emergency_contact_phone = 'Emergency contact phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.bmi || parseFloat(formData.bmi) < 10 || parseFloat(formData.bmi) > 100)
      newErrors.bmi = 'Valid BMI is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSave = () => {
    if (validateStep2()) {
      const patient: Patient = {
        patient_id: `P${Date.now()}`,
        age: parseInt(formData.age),
        gender: formData.gender,
        location: formData.location,
        bmi: parseFloat(formData.bmi),
        smoker_status: formData.smoker_status,
        alcohol_use: formData.alcohol_use,
        chronic_conditions: formData.chronic_conditions.join(', '),
        registration_date: new Date().toISOString().split('T')[0],
        insurance_type: formData.insurance_type,
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
      };

      addPatient(patient);
      showToast('Patient registered successfully!', 'success');
      onNavigate('dashboard');
    }
  };

  const conditions = [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Heart Disease',
    'Cancer',
    'Kidney Disease',
    'Liver Disease',
    'Arthritis',
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {step === 1 ? 'Personal Details' : 'Clinical & ML Details'}
          </h1>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center">
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 1 ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            ></div>
            <div
              className={`flex-1 h-2 rounded-full ml-2 ${
                step >= 2 ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm font-medium text-gray-600">Step 1</span>
            <span className="text-sm font-medium text-gray-600">Step 2</span>
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.age ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.emergency_contact_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.emergency_contact_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone *
                </label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.emergency_contact_phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.emergency_contact_phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_phone}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BMI *</label>
                <input
                  type="number"
                  step="0.1"
                  name="bmi"
                  value={formData.bmi}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.bmi ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.bmi && <p className="text-red-500 text-xs mt-1">{errors.bmi}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Smoker Status *
                </label>
                <select
                  name="smoker_status"
                  value={formData.smoker_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alcohol Use *
                </label>
                <select
                  name="alcohol_use"
                  value={formData.alcohol_use}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Type *
                </label>
                <select
                  name="insurance_type"
                  value={formData.insurance_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="self-pay">Self Pay</option>
                  <option value="gov">Government</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chronic Conditions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {conditions.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => handleConditionToggle(condition)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      formData.chronic_conditions.includes(condition)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Patient
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
