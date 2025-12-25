import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Visit } from "@/types/hospital";
import { useData } from "@/context/DataContext";
import api from "@/services/api";

interface AddVisitModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddVisitModal({ open, onClose }: AddVisitModalProps) {
  const {
    generateVisitId,
    patients,
    doctors,
    getVisitsByPatient,
    refreshVisits,
  } = useData();

  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const [formData, setFormData] = useState<Partial<Visit>>({
    visit_id: "",
    patient_id: "",
    visit_date: new Date().toISOString().split("T")[0],
    severity_score: 0,
    visit_type: "OP",
    length_of_stay: 0,
    lab_result_glucose: undefined,
    lab_result_bp: "",
    previous_visit_gap_days: 0,
    readmitted_within_30_days: "N/A",
    visit_cost: undefined,
    doctor_name: "",
    doctor_speciality: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- INIT ---------- */

  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        visit_id: generateVisitId(),
      }));
      setPatientSearch("");
      setErrors({});
    }
  }, [open, generateVisitId]);

  /* ---------- PREVIOUS VISIT GAP ---------- */

  useEffect(() => {
    if (formData.patient_id && formData.visit_date) {
      const visits = getVisitsByPatient(formData.patient_id);
      if (visits.length > 0) {
        const last = visits.sort(
          (a, b) =>
            new Date(b.visit_date).getTime() -
            new Date(a.visit_date).getTime()
        )[0];

        const gap = Math.floor(
          (new Date(formData.visit_date).getTime() -
            new Date(last.visit_date).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        setFormData((p) => ({
          ...p,
          previous_visit_gap_days: Math.max(0, gap),
        }));
      }
    }
  }, [formData.patient_id, formData.visit_date, getVisitsByPatient]);

  /* ---------- DOCTOR SPECIALITY ---------- */

  useEffect(() => {
    if (formData.doctor_name) {
      const doc = doctors.find(
        (d) => d.doctor_name === formData.doctor_name
      );
      if (doc) {
        setFormData((p) => ({
          ...p,
          doctor_speciality: doc.doctor_speciality,
        }));
      }
    }
  }, [formData.doctor_name, doctors]);

  /* ---------- VALIDATION ---------- */

  const validate = () => {
    const e: Record<string, string> = {};

    if (!formData.patient_id) e.patient_id = "Patient is required";
    if (!formData.visit_date) e.visit_date = "Visit date required";
    if (formData.severity_score! < 0 || formData.severity_score! > 5)
      e.severity_score = "Severity must be 0–5";
    if (!formData.lab_result_glucose)
      e.lab_result_glucose = "Glucose required";
    if (!formData.lab_result_bp) e.lab_result_bp = "BP required";
    if (!formData.visit_cost) e.visit_cost = "Visit cost required";
    if (!formData.doctor_name) e.doctor_name = "Doctor required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- SUBMIT ---------- */

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      await api.post("/visits", {
        ...formData,
        severity_score: Number(formData.severity_score),
        length_of_stay: Number(formData.length_of_stay),
        lab_result_glucose: Number(formData.lab_result_glucose),
        visit_cost: Number(formData.visit_cost),
      });

      toast({
        title: "Visit Added",
        description: `Visit ${formData.visit_id} recorded successfully.`,
      });

      await refreshVisits();
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          "Failed to add visit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- UI (UNCHANGED) ---------- */

  const filteredPatients = patients.filter(
    (p) =>
      p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.patient_id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const selectedPatient = patients.find(
    (p) => p.patient_id === formData.patient_id
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Visit</DialogTitle>
        </DialogHeader>

        {/* 🔹 UI CONTENT UNCHANGED — SAME AS YOUR CODE */}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Visit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
