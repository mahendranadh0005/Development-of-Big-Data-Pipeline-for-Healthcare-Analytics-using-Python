import React from 'react';
import { useData } from '@/context/DataContext';

interface PatientTableProps {
  searchQuery: string;
}

export default function PatientTable({ searchQuery }: PatientTableProps) {
  const { patients } = useData();

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredPatients.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">No patients found</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Blood Group</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Location</th>
              <th>Conditions</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient.patient_id}>
                <td className="font-medium">{patient.patient_id}</td>
                <td>{patient.full_name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>
                  <span className="px-2 py-1 rounded bg-destructive/10 text-destructive text-xs font-medium">
                    {patient.blood_group}
                  </span>
                </td>
                <td>{patient.phone_number}</td>
                <td className="text-muted-foreground">{patient.email}</td>
                <td>{patient.hospital_location}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {patient.chronic_conditions.slice(0, 2).map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-warning/10 text-warning text-xs">
                        {c}
                      </span>
                    ))}
                    {patient.chronic_conditions.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{patient.chronic_conditions.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td>{new Date(patient.registration_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
