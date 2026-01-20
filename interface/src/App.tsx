import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Dashboard from './components/Dashboard';
import AddPatient from './components/AddPatient';
import PatientList from './components/PatientList';
import PatientProfile from './components/PatientProfile';
import AddVisit from './components/AddVisit';
import CSVUpload from './components/CSVUpload';
import VisitsList from './components/VisitsList';
import { Activity } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const navigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (currentPage === 'dashboard') {
      return <Dashboard onNavigate={navigate} />;
    }
    if (currentPage === 'add-patient') {
      return <AddPatient onNavigate={navigate} />;
    }
    if (currentPage === 'patients') {
      return <PatientList onNavigate={navigate} />;
    }
    if (currentPage === 'visits') {
      return <VisitsList onNavigate={navigate} />;
    }
    if (currentPage === 'upload') {
      return <CSVUpload onNavigate={navigate} />;
    }
    if (currentPage.startsWith('patient-')) {
      const patientId = currentPage.replace('patient-', '');
      return <PatientProfile patientId={patientId} onNavigate={navigate} />;
    }
    if (currentPage.startsWith('add-visit-')) {
      const patientId = currentPage.replace('add-visit-', '');
      return <AddVisit patientId={patientId} onNavigate={navigate} />;
    }
    return <Dashboard onNavigate={navigate} />;
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
        <nav className="bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => navigate('dashboard')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-gray-800">Hospital Records</h1>
                  <p className="text-xs text-gray-600">Management System</p>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('dashboard')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('patients')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'patients' || currentPage.startsWith('patient-')
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Patients
                </button>
                <button
                  onClick={() => navigate('visits')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'visits'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Visits
                </button>
                <button
                  onClick={() => navigate('upload')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'upload'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Upload CSV
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderPage()}</main>
      </div>
    </AppProvider>
  );
}

export default App;
