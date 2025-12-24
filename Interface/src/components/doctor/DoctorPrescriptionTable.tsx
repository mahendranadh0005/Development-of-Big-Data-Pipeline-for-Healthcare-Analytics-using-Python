import React from 'react';
import { useData } from '@/context/DataContext';

interface DoctorPrescriptionTableProps {
  searchQuery: string;
  doctorName: string;
}

export default function DoctorPrescriptionTable({ searchQuery, doctorName }: DoctorPrescriptionTableProps) {
  const { getPrescriptionsByDoctor, patients } = useData();
  const prescriptions = getPrescriptionsByDoctor(doctorName);

  const filtered = prescriptions.filter(p => 
    p.prescription_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.drug_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patients.find(pt => pt.patient_id === p.patient_id)?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) return <div className="glass-card p-8 text-center"><p className="text-muted-foreground">No prescriptions found</p></div>;

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Patient</th><th>Drug</th><th>Dosage</th><th>Qty</th><th>Days</th><th>Date</th><th>Cost</th></tr></thead>
          <tbody>
            {filtered.map(p => {
              const patient = patients.find(pt => pt.patient_id === p.patient_id);
              return (
                <tr key={p.prescription_id}>
                  <td className="font-medium">{p.prescription_id}</td>
                  <td>{patient?.full_name}</td>
                  <td><span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">{p.drug_name}</span></td>
                  <td>{p.dosage}</td>
                  <td>{p.quantity}</td>
                  <td>{p.days_supply}</td>
                  <td>{new Date(p.prescribed_date).toLocaleDateString()}</td>
                  <td>${p.cost.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
