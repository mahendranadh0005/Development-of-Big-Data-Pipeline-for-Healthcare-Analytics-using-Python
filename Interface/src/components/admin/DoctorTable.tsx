import React from 'react';
import { useData } from '@/context/DataContext';

interface DoctorTableProps {
  searchQuery: string;
}

export default function DoctorTable({ searchQuery }: DoctorTableProps) {
  const { doctors, visits } = useData();

  const filteredDoctors = doctors.filter(d =>
    d.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.doctor_speciality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredDoctors.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">No doctors found</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>User ID</th>
              <th>Speciality</th>
              <th>Total Visits</th>
              <th>IP Visits</th>
              <th>OP Visits</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map(doctor => {
              const doctorVisits = visits.filter(v => v.doctor_name === doctor.doctor_name);
              const ipVisits = doctorVisits.filter(v => v.visit_type === 'IP').length;
              const opVisits = doctorVisits.filter(v => v.visit_type === 'OP').length;
              
              return (
                <tr key={doctor.user_id}>
                  <td className="font-medium">{doctor.doctor_name}</td>
                  <td className="text-muted-foreground">{doctor.user_id}</td>
                  <td>
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                      {doctor.doctor_speciality}
                    </span>
                  </td>
                  <td>{doctorVisits.length}</td>
                  <td>
                    <span className="text-destructive">{ipVisits}</span>
                  </td>
                  <td>
                    <span className="text-success">{opVisits}</span>
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
