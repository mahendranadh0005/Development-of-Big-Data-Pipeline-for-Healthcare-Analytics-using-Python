import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import api from "@/services/api";

import {
  Users,
  Calendar,
  UserPlus,
  Stethoscope,
  FileUp,
  LogOut,
  Activity,
  TrendingUp,
  Search,
  Plus,
  ChevronRight,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import AddPatientModal from "@/components/admin/AddPatientModal";
import AddVisitModal from "@/components/admin/AddVisitModal";
import AddDoctorModal from "@/components/admin/AddDoctorModal";
import CSVUploadModal from "@/components/admin/CSVUploadModal";

import PatientTable from "@/components/admin/PatientTable";
import VisitTable from "@/components/admin/VisitTable";
import DoctorTable from "@/components/admin/DoctorTable";

type Tab = "dashboard" | "patients" | "visits" | "doctors" | "upload";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { patients, visits } = useData();

  // doctors are backend-driven
  const [doctors, setDoctors] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  const [csvType, setCsvType] = useState<"patients" | "visits">("patients");

  /* ---------------- ROLE PROTECTION ---------------- */

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Access Denied
      </div>
    );
  }

  /* ---------------- FETCH DOCTORS ---------------- */

  const fetchDoctors = async () => {
    const res = await api.get("/users?role=doctor");
    setDoctors(res.data);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  /* ---------------- STATS ---------------- */

  const recentVisits = [...visits]
    .sort(
      (a, b) =>
        new Date(b.visit_date).getTime() -
        new Date(a.visit_date).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: Users,
      onClick: () => setActiveTab("patients"),
    },
    {
      title: "Total Visits",
      value: visits.length,
      icon: Calendar,
      onClick: () => setActiveTab("visits"),
    },
    {
      title: "Total Doctors",
      value: doctors.length,
      icon: Stethoscope,
      onClick: () => setActiveTab("doctors"),
    },
    {
      title: "This Month",
      value: visits.filter((v) => {
        const d = new Date(v.visit_date);
        const now = new Date();
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }).length,
      icon: TrendingUp,
      onClick: () => setActiveTab("visits"),
    },
  ];

  const openCSVUpload = (type: "patients" | "visits") => {
    setCsvType(type);
    setShowCSVUpload(true);
  };

  /* ---------------- RENDER ---------------- */

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((s) => (
                <div
                  key={s.title}
                  className="stat-card cursor-pointer"
                  onClick={s.onClick}
                >
                  <s.icon className="w-6 h-6 mb-2" />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm">{s.title}</p>
                </div>
              ))}
            </div>

            {/* Recent visits */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Recent Visits</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Visit ID</th>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Doctor</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisits.map((v) => (
                    <tr key={v.visit_id}>
                      <td>{v.visit_id}</td>
                      <td>{v.patient_id}</td>
                      <td>{new Date(v.visit_date).toLocaleDateString()}</td>
                      <td>{v.doctor_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "patients":
        return (
          <>
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={() => setShowAddPatient(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Patient
              </Button>
              <Button
                variant="outline"
                onClick={() => openCSVUpload("patients")}
              >
                <FileUp className="w-4 h-4 mr-2" /> Upload CSV
              </Button>
            </div>
            <PatientTable searchQuery={searchQuery} />
          </>
        );

      case "visits":
        return (
          <>
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Search visits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={() => setShowAddVisit(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Visit
              </Button>
              <Button
                variant="outline"
                onClick={() => openCSVUpload("visits")}
              >
                <FileUp className="w-4 h-4 mr-2" /> Upload CSV
              </Button>
            </div>
            <VisitTable searchQuery={searchQuery} />
          </>
        );

      case "doctors":
        return (
          <>
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={() => setShowAddDoctor(true)}>
                <UserPlus className="w-4 h-4 mr-2" /> Add Doctor
              </Button>
            </div>
            <DoctorTable searchQuery={searchQuery} doctors={doctors} />
          </>
        );

      case "upload":
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div
              className="glass-card p-6 cursor-pointer"
              onClick={() => openCSVUpload("patients")}
            >
              <Users className="w-8 h-8 mb-2" />
              <p>Upload Patients CSV</p>
            </div>
            <div
              className="glass-card p-6 cursor-pointer"
              onClick={() => openCSVUpload("visits")}
            >
              <Calendar className="w-8 h-8 mb-2" />
              <p>Upload Visits CSV</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b p-4 flex justify-between">
        <div className="flex items-center gap-3">
          <Building2 />
          <div>
            <p className="font-bold">Hospital Admin</p>
            <p className="text-xs">{user?.id}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Modals */}
      <AddPatientModal open={showAddPatient} onClose={() => setShowAddPatient(false)} />
      <AddVisitModal open={showAddVisit} onClose={() => setShowAddVisit(false)} />
      <AddDoctorModal
        open={showAddDoctor}
        onClose={() => {
          setShowAddDoctor(false);
          fetchDoctors();
        }}
      />
      <CSVUploadModal
        open={showCSVUpload}
        onClose={() => setShowCSVUpload(false)}
        type={csvType}
      />
    </div>
  );
}
