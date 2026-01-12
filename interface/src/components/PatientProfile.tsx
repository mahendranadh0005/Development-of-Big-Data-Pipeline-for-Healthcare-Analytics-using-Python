import { useState } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PatientProfileProps {
  patientId: string;
  onNavigate: (page: string) => void;
}

export default function PatientProfile({ patientId, onNavigate }: PatientProfileProps) {
  const { getPatient, getPatientVisits } = useApp();
  const patient = getPatient(patientId);
  const visits = getPatientVisits(patientId);
  const [expandedVisits, setExpandedVisits] = useState<Set<string>>(new Set());

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

  const toggleVisit = (visitId: string) => {
    setExpandedVisits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(visitId)) {
        newSet.delete(visitId);
      } else {
        newSet.add(visitId);
      }
      return newSet;
    });
  };

  const getSeverityColor = (score: number) => {
    if (score <= 2) return 'bg-green-100 text-green-700';
    if (score <= 3) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => onNavigate('patients')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patient List
      </button>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{patient.full_name}</h1>
              <p className="text-gray-600">ID: {patient.patient_id}</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              patient.insurance_type === 'gov'
                ? 'bg-blue-100 text-blue-700'
                : patient.insurance_type === 'private'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {patient.insurance_type}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-800">{patient.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{patient.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium text-gray-800">{patient.location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-medium text-gray-800">{patient.age} years</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium text-gray-800 capitalize">{patient.gender}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">BMI</p>
              <p className="font-medium text-gray-800">{patient.bmi}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Clinical Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Smoker Status</p>
              <p className="font-medium text-gray-800 capitalize">{patient.smoker_status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Alcohol Use</p>
              <p className="font-medium text-gray-800 capitalize">{patient.alcohol_use}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Chronic Conditions</p>
              <p className="font-medium text-gray-800">
                {patient.chronic_conditions || 'None reported'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-800">{patient.emergency_contact_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-800">{patient.emergency_contact_phone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Visits Timeline</h2>
          <button
            onClick={() => onNavigate(`add-visit-${patientId}`)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Visit
          </button>
        </div>

        {visits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No visits recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div
                key={visit.visit_id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleVisit(visit.visit_id)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">
                        {visit.diagnosis_description}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(visit.visit_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                        visit.severity_score
                      )}`}
                    >
                      Severity: {visit.severity_score}/5
                    </span>
                  </div>
                  {expandedVisits.has(visit.visit_id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedVisits.has(visit.visit_id) && (
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Doctor Specialty</p>
                        <p className="font-medium text-gray-800">{visit.doctor_specialty}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Diagnosis Code</p>
                        <p className="font-medium text-gray-800">{visit.diagnosis_code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Length of Stay</p>
                        <p className="font-medium text-gray-800">{visit.length_of_stay} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Visit Cost</p>
                        <p className="font-medium text-gray-800">${visit.visit_cost}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Blood Pressure</p>
                        <p className="font-medium text-gray-800">{visit.lab_result_bp}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Glucose Level</p>
                        <p className="font-medium text-gray-800">{visit.lab_result_glucose} mg/dL</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Previous Visit Gap</p>
                        <p className="font-medium text-gray-800">
                          {visit.previous_visit_gap_days} days
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Readmitted Within 30 Days</p>
                        <p className="font-medium text-gray-800 capitalize">
                          {visit.readmitted_within_30_days}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
