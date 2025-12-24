import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { 
  Users, Calendar, FileText, FileUp, LogOut,
  Activity, TrendingUp, TrendingDown, Minus, Search, Plus, ChevronRight,
  Stethoscope, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddPrescriptionModal from '@/components/doctor/AddPrescriptionModal';
import DoctorCSVUploadModal from '@/components/doctor/DoctorCSVUploadModal';
import DoctorVisitTable from '@/components/doctor/DoctorVisitTable';
import DoctorPrescriptionTable from '@/components/doctor/DoctorPrescriptionTable';
import DoctorPatientTable from '@/components/doctor/DoctorPatientTable';

type Tab = 'dashboard' | 'patients' | 'visits' | 'prescriptions' | 'upload';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const { getVisitsByDoctor, getPrescriptionsByDoctor, getPatientsByDoctor, patients } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  const doctorName = user?.name || '';
  const doctorVisits = getVisitsByDoctor(doctorName);
  const doctorPrescriptions = getPrescriptionsByDoctor(doctorName);
  const doctorPatients = getPatientsByDoctor(doctorName);

  // Calculate visit counts per patient
  const patientVisitCounts = doctorPatients.map(patient => {
    const patientVisits = doctorVisits.filter(v => v.patient_id === patient.patient_id);
    return {
      patient,
      visitCount: patientVisits.length,
      lastVisit: patientVisits.sort((a, b) => 
        new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
      )[0]
    };
  });

  // Calculate severity trends
  const getSeverityTrend = (patientId: string) => {
    const patientVisits = doctorVisits
      .filter(v => v.patient_id === patientId)
      .sort((a, b) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime());
    
    if (patientVisits.length < 2) return 'neutral';
    
    const lastTwo = patientVisits.slice(-2);
    const diff = lastTwo[1].severity_score - lastTwo[0].severity_score;
    
    if (diff > 0) return 'increased';
    if (diff < 0) return 'decreased';
    return 'neutral';
  };

  // Recent visits
  const recentVisits = [...doctorVisits]
    .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: 'My Patients',
      value: doctorPatients.length,
      icon: Users,
      color: 'text-primary',
      onClick: () => setActiveTab('patients')
    },
    {
      title: 'Total Visits',
      value: doctorVisits.length,
      icon: Calendar,
      color: 'text-accent',
      onClick: () => setActiveTab('visits')
    },
    {
      title: 'Prescriptions',
      value: doctorPrescriptions.length,
      icon: FileText,
      color: 'text-success',
      onClick: () => setActiveTab('prescriptions')
    },
    {
      title: 'Avg Severity',
      value: doctorVisits.length > 0 
        ? (doctorVisits.reduce((sum, v) => sum + v.severity_score, 0) / doctorVisits.length).toFixed(1)
        : '0',
      icon: Activity,
      color: 'text-warning',
      onClick: () => setActiveTab('visits')
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.title}
                  className="stat-card"
                  onClick={stat.onClick}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Button
                variant="outline"
                className="h-auto py-4 justify-start gap-3"
                onClick={() => setShowAddPrescription(true)}
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Add Prescription</p>
                  <p className="text-xs text-muted-foreground">Create new prescription</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 justify-start gap-3"
                onClick={() => setShowCSVUpload(true)}
              >
                <div className="p-2 rounded-lg bg-accent/10">
                  <FileUp className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Upload Prescriptions</p>
                  <p className="text-xs text-muted-foreground">Bulk import from CSV</p>
                </div>
              </Button>
            </div>

            {/* Patient Severity Trends */}
            <div className="glass-card p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-4">Patient Severity Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patientVisitCounts.slice(0, 6).map(({ patient, visitCount }) => {
                  const trend = getSeverityTrend(patient.patient_id);
                  return (
                    <div key={patient.patient_id} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground">{patient.full_name}</p>
                          <p className="text-xs text-muted-foreground">{visitCount} visits</p>
                        </div>
                        {trend === 'increased' && (
                          <div className="feedback-negative flex items-center gap-1 text-xs">
                            <TrendingUp className="w-3 h-3" />
                            Increased
                          </div>
                        )}
                        {trend === 'decreased' && (
                          <div className="feedback-positive flex items-center gap-1 text-xs">
                            <TrendingDown className="w-3 h-3" />
                            Improved
                          </div>
                        )}
                        {trend === 'neutral' && (
                          <div className="feedback-neutral flex items-center gap-1 text-xs">
                            <Minus className="w-3 h-3" />
                            No Change
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Visits */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Recent Visits</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('visits')}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Visit ID</th>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.map(visit => {
                      const patient = patients.find(p => p.patient_id === visit.patient_id);
                      const trend = getSeverityTrend(visit.patient_id);
                      return (
                        <tr key={visit.visit_id}>
                          <td className="font-medium">{visit.visit_id}</td>
                          <td>{patient?.full_name || visit.patient_id}</td>
                          <td>{new Date(visit.visit_date).toLocaleDateString()}</td>
                          <td>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              visit.visit_type === 'IP' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                            }`}>
                              {visit.visit_type}
                            </span>
                          </td>
                          <td>
                            <span className={`severity-badge severity-${visit.severity_score}`}>
                              {visit.severity_score}/5
                            </span>
                          </td>
                          <td>
                            {trend === 'increased' && (
                              <span className="text-destructive flex items-center gap-1 text-xs">
                                <TrendingUp className="w-3 h-3" /> Worsening
                              </span>
                            )}
                            {trend === 'decreased' && (
                              <span className="text-success flex items-center gap-1 text-xs">
                                <TrendingDown className="w-3 h-3" /> Improving
                              </span>
                            )}
                            {trend === 'neutral' && (
                              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                <Minus className="w-3 h-3" /> Stable
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'patients':
        return (
          <div className="fade-in">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <DoctorPatientTable searchQuery={searchQuery} doctorName={doctorName} />
          </div>
        );

      case 'visits':
        return (
          <div className="fade-in">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search visits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <DoctorVisitTable searchQuery={searchQuery} doctorName={doctorName} />
          </div>
        );

      case 'prescriptions':
        return (
          <div className="fade-in">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowAddPrescription(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Prescription
              </Button>
            </div>
            <DoctorPrescriptionTable searchQuery={searchQuery} doctorName={doctorName} />
          </div>
        );

      case 'upload':
        return (
          <div className="fade-in">
            <div
              className="glass-card p-6 cursor-pointer hover:shadow-hover transition-all max-w-md"
              onClick={() => setShowCSVUpload(true)}
            >
              <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                <FileUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Prescriptions CSV</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bulk import prescription records from a CSV file. Only prescriptions for your visits will be accepted.
              </p>
              <div className="p-3 bg-warning/10 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                <p className="text-xs text-warning">
                  Prescriptions must be linked to visits assigned to you
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: Activity },
    { id: 'patients' as Tab, label: 'My Patients', icon: Users },
    { id: 'visits' as Tab, label: 'My Visits', icon: Calendar },
    { id: 'prescriptions' as Tab, label: 'Prescriptions', icon: FileText },
    { id: 'upload' as Tab, label: 'CSV Upload', icon: FileUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">{user?.name}</h1>
              <p className="text-xs text-muted-foreground">{user?.speciality}</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Modals */}
      <AddPrescriptionModal 
        open={showAddPrescription} 
        onClose={() => setShowAddPrescription(false)}
        doctorName={doctorName}
        doctorSpeciality={user?.speciality || 'General'}
      />
      <DoctorCSVUploadModal 
        open={showCSVUpload} 
        onClose={() => setShowCSVUpload(false)}
      />
    </div>
  );
}
