import { Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Papa from 'papaparse';

interface VisitsListProps {
  onNavigate: (page: string) => void;
}

export default function VisitsList({ onNavigate }: VisitsListProps) {
  const { visits, getPatient, showToast } = useApp();

  const handleExport = () => {
    if (visits.length === 0) {
      showToast('No visits to export', 'error');
      return;
    }

    const csvData = visits.map((v) => ({
      visit_id: v.visit_id,
      patient_id: v.patient_id,
      visit_date: v.visit_date,
      diagnosis_code: v.diagnosis_code,
      diagnosis_description: v.diagnosis_description,
      severity_score: v.severity_score,
      length_of_stay: v.length_of_stay,
      lab_result_glucose: v.lab_result_glucose,
      lab_result_bp: v.lab_result_bp,
      previous_visit_gap_days: v.previous_visit_gap_days,
      readmitted_within_30_days: v.readmitted_within_30_days,
      visit_cost: v.visit_cost,
      doctor_specialty: v.doctor_specialty,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visits_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Visits data exported successfully!', 'success');
  };

  const getSeverityColor = (score: number) => {
    if (score <= 2) return 'bg-green-100 text-green-700';
    if (score <= 3) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Visits</h1>
          <p className="text-gray-600 mt-1">View all patient visits across the hospital</p>
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
        {visits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No visits recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Visit ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Diagnosis</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Severity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cost</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => {
                  const patient = getPatient(visit.patient_id);
                  return (
                    <tr
                      key={visit.visit_id}
                      onClick={() => onNavigate(`patient-${visit.patient_id}`)}
                      className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">{visit.visit_id}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {patient?.full_name || visit.patient_id}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(visit.visit_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {visit.diagnosis_description}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(
                            visit.severity_score
                          )}`}
                        >
                          {visit.severity_score}/5
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {visit.doctor_specialty}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">${visit.visit_cost}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
