import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Papa from 'papaparse';

interface PatientListProps {
  onNavigate: (page: string) => void;
}

export default function PatientList({ onNavigate }: PatientListProps) {
  const { patients, searchPatients, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const displayPatients = searchQuery ? searchPatients(searchQuery) : patients;

  const handleExport = () => {
    if (patients.length === 0) {
      showToast('No patients to export', 'error');
      return;
    }

    const csvData = patients.map((p) => ({
      patient_id: p.patient_id,
      age: p.age,
      gender: p.gender,
      location: p.location,
      bmi: p.bmi,
      smoker_status: p.smoker_status,
      alcohol_use: p.alcohol_use,
      chronic_conditions: p.chronic_conditions,
      registration_date: p.registration_date,
      insurance_type: p.insurance_type,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `patients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Patients data exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Patient List</h1>
          <p className="text-gray-600 mt-1">View and search all registered patients</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, ID, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {displayPatients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No patients found matching your search' : 'No patients registered yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Age</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Gender</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Insurance</th>
                </tr>
              </thead>
              <tbody>
                {displayPatients.map((patient) => (
                  <tr
                    key={patient.patient_id}
                    onClick={() => onNavigate(`patient-${patient.patient_id}`)}
                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.patient_id}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{patient.full_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.age}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                      {patient.gender}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.phone}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.location}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          patient.insurance_type === 'gov'
                            ? 'bg-blue-100 text-blue-700'
                            : patient.insurance_type === 'private'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {patient.insurance_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
