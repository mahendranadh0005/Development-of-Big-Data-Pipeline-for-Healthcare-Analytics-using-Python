import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { 
  Users, Calendar, UserPlus, Stethoscope, FileUp, LogOut,
  Activity, TrendingUp, Search, Filter, Plus, ChevronRight,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddPatientModal from '@/components/admin/AddPatientModal';
import AddVisitModal from '@/components/admin/AddVisitModal';
import AddDoctorModal from '@/components/admin/AddDoctorModal';
import CSVUploadModal from '@/components/admin/CSVUploadModal';
import PatientTable from '@/components/admin/PatientTable';
import VisitTable from '@/components/admin/VisitTable';
import DoctorTable from '@/components/admin/DoctorTable';

type Tab = 'dashboard' | 'patients' | 'visits' | 'doctors' | 'upload';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { patients, visits, doctors } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [csvType, setCsvType] = useState<'patients' | 'visits'>('patients');

  // Get recent visits (last 5)
  const recentVisits = [...visits]
    .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Patients',
      value: patients.length,
      icon: Users,
      color: 'text-primary',
      onClick: () => setActiveTab('patients')
    },
    {
      title: 'Total Visits',
      value: visits.length,
      icon: Calendar,
      color: 'text-accent',
      onClick: () => setActiveTab('visits')
    },
    {
      title: 'Total Doctors',
      value: doctors.length,
      icon: Stethoscope,
      color: 'text-success',
      onClick: () => setActiveTab('doctors')
    },
    {
      title: 'This Month',
      value: visits.filter(v => {
        const visitDate = new Date(v.visit_date);
        const now = new Date();
        return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
      }).length,
      icon: TrendingUp,
      color: 'text-warning',
      onClick: () => setActiveTab('visits')
    }
  ];

  const openCSVUpload = (type: 'patients' | 'visits') => {
    setCsvType(type);
    setShowCSVUpload(true);
  };

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Button
                variant="outline"
                className="h-auto py-4 justify-start gap-3"
                onClick={() => setShowAddPatient(true)}
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Add Patient</p>
                  <p className="text-xs text-muted-foreground">Register new patient</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 justify-start gap-3"
                onClick={() => setShowAddVisit(true)}
              >
                <div className="p-2 rounded-lg bg-accent/10">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Add Visit</p>
                  <p className="text-xs text-muted-foreground">Record patient visit</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 justify-start gap-3"
                onClick={() => setShowAddDoctor(true)}
              >
                <div className="p-2 rounded-lg bg-success/10">
                  <Stethoscope className="w-5 h-5 text-success" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Add Doctor</p>
                  <p className="text-xs text-muted-foreground">Register new doctor</p>
                </div>
              </Button>
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
                      <th>Doctor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.map(visit => {
                      const patient = patients.find(p => p.patient_id === visit.patient_id);
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
                          <td>{visit.doctor_name}</td>
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
              <div className="flex gap-2">
                <Button onClick={() => setShowAddPatient(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Patient
                </Button>
                <Button variant="outline" onClick={() => openCSVUpload('patients')}>
                  <FileUp className="w-4 h-4 mr-2" /> Upload CSV
                </Button>
              </div>
            </div>
            <PatientTable searchQuery={searchQuery} />
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
              <div className="flex gap-2">
                <Button onClick={() => setShowAddVisit(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Visit
                </Button>
                <Button variant="outline" onClick={() => openCSVUpload('visits')}>
                  <FileUp className="w-4 h-4 mr-2" /> Upload CSV
                </Button>
              </div>
            </div>
            <VisitTable searchQuery={searchQuery} />
          </div>
        );

      case 'doctors':
        return (
          <div className="fade-in">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowAddDoctor(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Doctor
              </Button>
            </div>
            <DoctorTable searchQuery={searchQuery} />
          </div>
        );

      case 'upload':
        return (
          <div className="fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className="glass-card p-6 cursor-pointer hover:shadow-hover transition-all"
                onClick={() => openCSVUpload('patients')}
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload Patients CSV</h3>
                <p className="text-sm text-muted-foreground">
                  Bulk import patient records from a CSV file
                </p>
              </div>

              <div
                className="glass-card p-6 cursor-pointer hover:shadow-hover transition-all"
                onClick={() => openCSVUpload('visits')}
              >
                <div className="p-3 rounded-xl bg-accent/10 w-fit mb-4">
                  <Calendar className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload Visits CSV</h3>
                <p className="text-sm text-muted-foreground">
                  Bulk import visit records from a CSV file
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
    { id: 'patients' as Tab, label: 'Patients', icon: Users },
    { id: 'visits' as Tab, label: 'Visits', icon: Calendar },
    { id: 'doctors' as Tab, label: 'Doctors', icon: Stethoscope },
    { id: 'upload' as Tab, label: 'CSV Upload', icon: FileUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Hospital Admin</h1>
              <p className="text-xs text-muted-foreground">{user?.name}</p>
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
      <AddPatientModal open={showAddPatient} onClose={() => setShowAddPatient(false)} />
      <AddVisitModal open={showAddVisit} onClose={() => setShowAddVisit(false)} />
      <AddDoctorModal open={showAddDoctor} onClose={() => setShowAddDoctor(false)} />
      <CSVUploadModal 
        open={showCSVUpload} 
        onClose={() => setShowCSVUpload(false)} 
        type={csvType}
      />
    </div>
  );
}
