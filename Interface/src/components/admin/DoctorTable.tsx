import React from "react";
import { Doctor } from "@/types/hospital";

interface DoctorTableProps {
  searchQuery: string;
  doctors: Doctor[];
}

export default function DoctorTable({
  searchQuery,
  doctors,
}: DoctorTableProps) {
  const filteredDoctors = doctors.filter(
    (d) =>
      d.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.doctor_speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Doctor Name</th>
            <th>Speciality</th>
            <th>User ID</th>
          </tr>
        </thead>
        <tbody>
          {filteredDoctors.map((doctor) => (
            <tr key={doctor.user_id}>
              <td className="font-medium">{doctor.doctor_name}</td>
              <td>{doctor.doctor_speciality}</td>
              <td>{doctor.user_id}</td>
            </tr>
          ))}

          {filteredDoctors.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-muted-foreground py-6">
                No doctors found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
