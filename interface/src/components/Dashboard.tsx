import { Users, Activity, UserPlus, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { patients, visits } = useApp();

  const recentPatients = patients
    .sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Patients',
      value: patients.length,
      icon: Users,
      color: 'bg-blue-500',
      action: () => onNavigate('patients'),
    },
    {
      title: 'Total Visits',
      value: visits.length,
      icon: Activity,
      color: 'bg-green-500',
      action: () => onNavigate('visits'),
    },
    {
      title: 'Recent Registrations',
      value: patients.filter(
        (p) =>
          new Date(p.registration_date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
      icon: TrendingUp,
      color: 'bg-teal-500',
      action: () => onNavigate('patients'),
    },
    {
      title: 'Add New Patient',
      value: '+',
      icon: UserPlus,
      color: 'bg-indigo-500',
      action: () => onNavigate('add-patient'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Hospital Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of patient records and visits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={stat.action}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Registrations</h2>
          {recentPatients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No patients registered yet</p>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div
                  key={patient.patient_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onNavigate(`patient-${patient.patient_id}`)}
                >
                  <div>
                    <p className="font-medium text-gray-800">{patient.full_name}</p>
                    <p className="text-sm text-gray-500">ID: {patient.patient_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(patient.registration_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{patient.insurance_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('add-patient')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Add New Patient
            </button>
            <button
              onClick={() => onNavigate('patients')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              View Patient List
            </button>
            <button
              onClick={() => onNavigate('upload')}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Activity className="w-5 h-5" />
              Upload CSV Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
