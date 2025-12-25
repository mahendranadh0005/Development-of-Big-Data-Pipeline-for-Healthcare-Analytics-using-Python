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
import api from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { DRUG_CATEGORIES, Prescription, Visit, Patient } from "@/types/hospital";
import { useData } from "@/context/DataContext";

interface AddPrescriptionModalProps {
  open: boolean;
  onClose: () => void;
  doctorName: string;
  doctorSpeciality: string;
}

export default function AddPrescriptionModal({
  open,
  onClose,
  doctorName,
  doctorSpeciality,
}: AddPrescriptionModalProps) {
  const { generatePrescriptionId } = useData();

  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<Prescription>>({
    prescription_id: "",
    visit_id: "",
    patient_id: "",
    diagnosis_id: "",
    diagnosis_description: "",
    drug_name: "",
    dosage: "",
    quantity: undefined,
    days_supply: undefined,
    prescribed_date: new Date().toISOString().split("T")[0],
    cost: undefined,
    doctor_name: doctorName,
  });

  const drugs =
    DRUG_CATEGORIES[doctorSpeciality]?.drugs ??
    DRUG_CATEGORIES.General.drugs;

  const drugCategory =
    DRUG_CATEGORIES[doctorSpeciality]?.category ??
    "General Medicine";

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    if (!open) return;

    setFormData((prev) => ({
      ...prev,
      prescription_id: generatePrescriptionId(),
      doctor_name: doctorName,
    }));
    setErrors({});

    Promise.all([
      api.get(`/visits?doctor=${encodeURIComponent(doctorName)}`),
      api.get("/patients"),
    ])
      .then(([visitsRes, patientsRes]) => {
        setVisits(visitsRes.data || []);
        setPatients(patientsRes.data || []);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to load visits or patients",
          variant: "destructive",
        });
      });
  }, [open, doctorName, generatePrescriptionId]);

  /* ---------------- AUTO PATIENT FILL ---------------- */

  useEffect(() => {
    if (!formData.visit_id) return;

    const visit = visits.find((v) => v.visit_id === formData.visit_id);
    if (visit) {
      setFormData((prev) => ({
        ...prev,
        patient_id: visit.patient_id,
      }));
    }
  }, [formData.visit_id, visits]);

  /* ---------------- VALIDATION ---------------- */

  const validate = () => {
    const e: Record<string, string> = {};

    if (!formData.visit_id) e.visit_id = "Visit is required";
    if (!formData.diagnosis_id) e.diagnosis_id = "Diagnosis ID required";
    if (!formData.diagnosis_description)
      e.diagnosis_description = "Description required";
    if (!formData.drug_name) e.drug_name = "Drug required";
    if (!formData.dosage) e.dosage = "Dosage required";
    if (!formData.quantity || formData.quantity < 1)
      e.quantity = "Valid quantity required";
    if (!formData.days_supply || formData.days_supply < 1)
      e.days_supply = "Valid days supply required";
    if (formData.cost == null || formData.cost < 0)
      e.cost = "Valid cost required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await api.post("/prescriptions", {
        ...formData,
        drug_category: drugCategory,
      });

      toast({
        title: "Prescription Added",
        description: "Prescription created successfully.",
      });

      onClose();
    } catch {
      toast({
        title: "Error",
        description: "Failed to add prescription",
        variant: "destructive",
      });
    }
  };

  /* ---------------- UI (UNCHANGED) ---------------- */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Prescription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visit</Label>
              <Select
                value={formData.visit_id}
                onValueChange={(v) =>
                  setFormData({ ...formData, visit_id: v })
                }
              >
                <SelectTrigger
                  className={errors.visit_id ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select visit" />
                </SelectTrigger>
                <SelectContent>
                  {visits.map((v) => {
                    const p = patients.find(
                      (x) => x.patient_id === v.patient_id
                    );
                    return (
                      <SelectItem key={v.visit_id} value={v.visit_id}>
                        {v.visit_id} - {p?.full_name || "Unknown"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Patient ID</Label>
              <Input value={formData.patient_id} readOnly className="bg-muted" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Diagnosis ID</Label>
              <Input
                value={formData.diagnosis_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    diagnosis_id: e.target.value,
                  })
                }
                className={errors.diagnosis_id ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Drug</Label>
              <Select
                value={formData.drug_name}
                onValueChange={(v) =>
                  setFormData({ ...formData, drug_name: v })
                }
              >
                <SelectTrigger
                  className={errors.drug_name ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select drug" />
                </SelectTrigger>
                <SelectContent>
                  {drugs.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Diagnosis Description</Label>
            <Input
              value={formData.diagnosis_description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  diagnosis_description: e.target.value,
                })
              }
              className={
                errors.diagnosis_description ? "border-destructive" : ""
              }
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Input
              placeholder="Dosage"
              value={formData.dosage}
              onChange={(e) =>
                setFormData({ ...formData, dosage: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Qty"
              value={formData.quantity ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: Number(e.target.value),
                })
              }
            />
            <Input
              type="number"
              placeholder="Days"
              value={formData.days_supply ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  days_supply: Number(e.target.value),
                })
              }
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Cost"
              value={formData.cost ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input type="date" value={formData.prescribed_date} readOnly />
            <Input value={drugCategory} readOnly className="bg-muted" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Prescription</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
