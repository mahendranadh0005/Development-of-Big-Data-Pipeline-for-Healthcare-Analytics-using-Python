import React from 'react';
import { useData } from '@/context/DataContext';

interface DoctorPatientTableProps {
  searchQuery: string;
  doctorName: string;
}

export default function DoctorPatientTable({ searchQuery, doctorName }: DoctorPatientTableProps) {
  const { getPatientsByDoctor, getVisitsByDoctor } = useData();
  const patients = getPatientsByDoctor(doctorName);
  const visits = getVisitsByDoctor(doctorName);

  const filtered = patients.filter(p => 
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) return <div className="glass-card p-8 text-center"><p className="text-muted-foreground">No patients found</p></div>;

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Patient ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Visits</th><th>Conditions</th></tr></thead>
          <tbody>
            {filtered.map(p => {
              const visitCount = visits.filter(v => v.patient_id === p.patient_id).length;
              return (
                <tr key={p.patient_id}>
                  <td className="font-medium">{p.patient_id}</td>
                  <td>{p.full_name}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td><span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">{visitCount}</span></td>
                  <td><div className="flex flex-wrap gap-1">{p.chronic_conditions.slice(0, 2).map(c => <span key={c} className="px-2 py-0.5 rounded bg-warning/10 text-warning text-xs">{c}</span>)}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
