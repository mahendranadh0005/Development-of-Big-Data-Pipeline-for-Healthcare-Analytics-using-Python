import React from 'react';
import { useData } from '@/context/DataContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DoctorVisitTableProps {
  searchQuery: string;
  doctorName: string;
}

export default function DoctorVisitTable({ searchQuery, doctorName }: DoctorVisitTableProps) {
  const { getVisitsByDoctor, patients } = useData();
  const visits = getVisitsByDoctor(doctorName);

  const getSeverityTrend = (patientId: string) => {
    const patientVisits = visits.filter(v => v.patient_id === patientId).sort((a, b) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime());
    if (patientVisits.length < 2) return 'neutral';
    const lastTwo = patientVisits.slice(-2);
    const diff = lastTwo[1].severity_score - lastTwo[0].severity_score;
    return diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'neutral';
  };

  const filtered = visits.filter(v => {
    const patient = patients.find(p => p.patient_id === v.patient_id);
    return v.visit_id.toLowerCase().includes(searchQuery.toLowerCase()) || patient?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime());

  if (filtered.length === 0) return <div className="glass-card p-8 text-center"><p className="text-muted-foreground">No visits found</p></div>;

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Visit ID</th><th>Patient</th><th>Date</th><th>Type</th><th>Severity</th><th>Trend</th><th>Cost</th></tr></thead>
          <tbody>
            {filtered.map(v => {
              const patient = patients.find(p => p.patient_id === v.patient_id);
              const trend = getSeverityTrend(v.patient_id);
              return (
                <tr key={v.visit_id}>
                  <td className="font-medium">{v.visit_id}</td>
                  <td>{patient?.full_name}</td>
                  <td>{new Date(v.visit_date).toLocaleDateString()}</td>
                  <td><span className={`px-2 py-1 rounded text-xs font-medium ${v.visit_type === 'IP' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{v.visit_type}</span></td>
                  <td><span className={`severity-badge severity-${v.severity_score}`}>{v.severity_score}/5</span></td>
                  <td>{trend === 'increased' ? <span className="feedback-negative text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" />Worsening</span> : trend === 'decreased' ? <span className="feedback-positive text-xs flex items-center gap-1"><TrendingDown className="w-3 h-3" />Improving</span> : <span className="feedback-neutral text-xs flex items-center gap-1"><Minus className="w-3 h-3" />Stable</span>}</td>
                  <td>${v.visit_cost.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
