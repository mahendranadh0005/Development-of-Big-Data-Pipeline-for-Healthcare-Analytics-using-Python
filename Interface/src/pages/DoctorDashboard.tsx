import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import {
  Users,
  Calendar,
  FileText,
  FileUp,
  LogOut,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Plus,
  ChevronRight,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddPrescriptionModal from "@/components/doctor/AddPrescriptionModal";
import DoctorCSVUploadModal from "@/components/doctor/DoctorCSVUploadModal";
import DoctorVisitTable from "@/components/doctor/DoctorVisitTable";
import DoctorPrescriptionTable from "@/components/doctor/DoctorPrescriptionTable";
import DoctorPatientTable from "@/components/doctor/DoctorPatientTable";
import { Visit, Prescription, Patient } from "@/types/hospital";

type Tab = "dashboard" | "patients" | "visits" | "prescriptions" | "upload";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const doctorName = user?.name || "";

  const [visits, setVisits] = useState<Visit[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    if (!doctorName) return;

    Promise.all([
      api.get(`/visits?doctor=${encodeURIComponent(doctorName)}`),
      api.get(`/prescriptions?doctor=${encodeURIComponent(doctorName)}`),
      api.get("/patients"),
    ]).then(([visitsRes, prescriptionsRes, patientsRes]) => {
      setVisits(visitsRes.data || []);
      setPrescriptions(prescriptionsRes.data || []);
      setPatients(patientsRes.data || []);
    });
  }, [doctorName]);

  /* ---------------- DERIVED DATA ---------------- */

  const doctorPatients = patients.filter((p) =>
    visits.some((v) => v.patient_id === p.patient_id)
  );

  const getSeverityTrend = (patientId: string) => {
    const patientVisits = visits
      .filter((v) => v.patient_id === patientId)
      .sort(
        (a, b) =>
          new Date(a.visit_date).getTime() -
          new Date(b.visit_date).getTime()
      );

    if (patientVisits.length < 2) return "neutral";

    const diff =
      patientVisits.at(-1)!.severity_score -
      patientVisits.at(-2)!.severity_score;

    return diff > 0
      ? "increased"
      : diff < 0
      ? "decreased"
      : "neutral";
  };

  const recentVisits = [...visits]
    .sort(
      (a, b) =>
        new Date(b.visit_date).getTime() -
        new Date(a.visit_date).getTime()
    )
    .slice(0, 5);

  /* ---------------- STATS ---------------- */

  const stats = [
    {
      title: "My Patients",
      value: doctorPatients.length,
      icon: Users,
      color: "text-primary",
      onClick: () => setActiveTab("patients"),
    },
    {
      title: "Total Visits",
      value: visits.length,
      icon: Calendar,
      color: "text-accent",
      onClick: () => setActiveTab("visits"),
    },
    {
      title: "Prescriptions",
      value: prescriptions.length,
      icon: FileText,
      color: "text-success",
      onClick: () => setActiveTab("prescriptions"),
    },
    {
      title: "Avg Severity",
      value:
        visits.length > 0
          ? (
              visits.reduce((s, v) => s + v.severity_score, 0) /
              visits.length
            ).toFixed(1)
          : "0",
      icon: Activity,
      color: "text-warning",
      onClick: () => setActiveTab("visits"),
    },
  ];

  /* ---------------- RENDER ---------------- */

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="fade-in">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((s, i) => (
                <div
                  key={s.title}
                  className="stat-card"
                  onClick={s.onClick}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-muted ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                </div>
              ))}
            </div>

            {/* Recent Visits */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Recent Visits</h3>
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
                  {recentVisits.map((v) => {
                    const patient = patients.find(
                      (p) => p.patient_id === v.patient_id
                    );
                    const trend = getSeverityTrend(v.patient_id);
                    return (
                      <tr key={v.visit_id}>
                        <td>{v.visit_id}</td>
                        <td>{patient?.full_name}</td>
                        <td>
                          {new Date(v.visit_date).toLocaleDateString()}
                        </td>
                        <td>{v.visit_type}</td>
                        <td>{v.severity_score}/5</td>
                        <td>
                          {trend === "increased" && (
                            <TrendingUp className="w-4 h-4 text-destructive" />
                          )}
                          {trend === "decreased" && (
                            <TrendingDown className="w-4 h-4 text-success" />
                          )}
                          {trend === "neutral" && (
                            <Minus className="w-4 h-4 text-muted-foreground" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "patients":
        return (
          <>
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <DoctorPatientTable
              searchQuery={searchQuery}
              doctorName={doctorName}
            />
          </>
        );

      case "visits":
        return (
          <>
            <Input
              placeholder="Search visits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <DoctorVisitTable
              searchQuery={searchQuery}
              doctorName={doctorName}
            />
          </>
        );

      case "prescriptions":
        return (
          <>
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search prescriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={() => setShowAddPrescription(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Prescription
              </Button>
            </div>
            <DoctorPrescriptionTable
              searchQuery={searchQuery}
              doctorName={doctorName}
            />
          </>
        );

      case "upload":
        return (
          <div
            className="glass-card p-6 cursor-pointer max-w-md"
            onClick={() => setShowCSVUpload(true)}
          >
            <FileUp className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Upload Prescriptions CSV</h3>
            <p className="text-sm text-muted-foreground">
              Only prescriptions linked to your visits are accepted.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-card border-b p-4 flex justify-between">
        <div className="flex items-center gap-3">
          <Stethoscope />
          <div>
            <h1 className="font-bold">{user?.name}</h1>
            <p className="text-xs">{user?.speciality}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </header>

      <main className="container mx-auto p-6">{renderContent()}</main>

      <AddPrescriptionModal
        open={showAddPrescription}
        onClose={() => setShowAddPrescription(false)}
        doctorName={doctorName}
        doctorSpeciality={user?.speciality || "General"}
      />

      <DoctorCSVUploadModal
        open={showCSVUpload}
        onClose={() => setShowCSVUpload(false)}
      />
    </div>
  );
}
