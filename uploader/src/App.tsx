import { Heart } from 'lucide-react';
import PatientSection from './components/PatientSection';
import VisitSection from './components/VisitSection';
import PrescriptionSection from './components/PrescriptionSection';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Healthcare Data Entry System
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Backend: http://localhost:5000 | Node.js + Express + MongoDB
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PatientSection />
        <VisitSection />
        <PrescriptionSection />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Production-ready frontend connected to Express + MongoDB backend
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
