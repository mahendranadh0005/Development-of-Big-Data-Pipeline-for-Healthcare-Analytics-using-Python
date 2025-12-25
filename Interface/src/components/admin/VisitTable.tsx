import React from "react";
import { useData } from "@/context/DataContext";

interface VisitTableProps {
  searchQuery: string;
}

export default function VisitTable({ searchQuery }: VisitTableProps) {
  const { visits, patients } = useData();

  const query = searchQuery.toLowerCase();

  const filteredVisits = visits
    .filter((v) => {
      const patient = patients.find(
        (p) => p.patient_id === v.patient_id
      );

      const patientName = patient?.full_name?.toLowerCase() || "";
      const visitId = v.visit_id?.toLowerCase() || "";
      const patientId = v.patient_id?.toLowerCase() || "";
      const doctorName = v.doctor_name?.toLowerCase() || "";

      return (
        visitId.includes(query) ||
        patientId.includes(query) ||
        patientName.includes(query) ||
        doctorName.includes(query)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.visit_date).getTime() -
        new Date(a.visit_date).getTime()
    );

  if (filteredVisits.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">No visits found</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Visit ID</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Stay (days)</th>
              <th>Glucose</th>
              <th>BP</th>
              <th>Cost</th>
              <th>Doctor</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit) => {
              const patient = patients.find(
                (p) => p.patient_id === visit.patient_id
              );

              return (
                <tr key={visit.visit_id}>
                  <td className="font-medium">{visit.visit_id}</td>

                  <td>
                    <div>
                      <p className="font-medium">
                        {patient?.full_name || "Unknown Patient"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {visit.patient_id}
                      </p>
                    </div>
                  </td>

                  <td>
                    {visit.visit_date
                      ? new Date(visit.visit_date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        visit.visit_type === "IP"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {visit.visit_type}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`severity-badge severity-${visit.severity_score}`}
                    >
                      {visit.severity_score}/5
                    </span>
                  </td>

                  <td>{visit.length_of_stay ?? 0}</td>

                  <td>{visit.lab_result_glucose ?? "-"}</td>

                  <td>{visit.lab_result_bp || "-"}</td>

                  <td>
                    $
                    {typeof visit.visit_cost === "number"
                      ? visit.visit_cost.toFixed(2)
                      : "0.00"}
                  </td>

                  <td>
                    <div>
                      <p className="font-medium">
                        {visit.doctor_name || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {visit.doctor_speciality || "-"}
                      </p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
