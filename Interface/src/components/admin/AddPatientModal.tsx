import React, { useEffect, useState } from "react";
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
import { useData } from "@/context/DataContext";
import api from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddPatientModal({
  open,
  onClose,
}: AddPatientModalProps) {
  const { generatePatientId, refreshPatients } = useData();

  const [formData, setFormData] = useState({
    patient_id: "",
    full_name: "",
    age: "",
    gender: "",
    blood_group: "",
    phone_number: "",
    email: "",
    emergency_contact: "",
    hospital_location: "",
    bmi: "",
    smoker_status: "",
    alcohol_use: "",
    chronic_conditions: "",
    registration_date: "",
    insurance_type: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- AUTO ID ---------------- */

  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        patient_id: generatePatientId(),
      }));
    }
  }, [open, generatePatientId]);

  /* ---------------- VALIDATION ---------------- */

  const validate = () => {
    const e: Record<string, string> = {};

    if (!formData.full_name.trim()) e.full_name = "Full name is required";
    if (!formData.age) e.age = "Age is required";
    if (!formData.gender) e.gender = "Gender is required";
    if (!formData.phone_number) e.phone_number = "Phone number is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      await api.post("/patients", {
        ...formData,
        age: Number(formData.age),
        bmi: formData.bmi ? Number(formData.bmi) : null,
        chronic_conditions: formData.chronic_conditions
          ? formData.chronic_conditions.split(",").map((c) => c.trim())
          : [],
      });

      toast({
        title: "Patient Added",
        description: `${formData.full_name} registered successfully.`,
      });

      await refreshPatients();
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Patient</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Patient ID</Label>
            <Input value={formData.patient_id} disabled />
          </div>

          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className={errors.full_name ? "border-destructive" : ""}
            />
          </div>

          <div>
            <Label>Age</Label>
            <Input
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              className={errors.age ? "border-destructive" : ""}
            />
          </div>

          <div>
            <Label>Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(v) =>
                setFormData({ ...formData, gender: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2">
            <Label>Chronic Conditions (comma separated)</Label>
            <Input
              value={formData.chronic_conditions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  chronic_conditions: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-6">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Patient"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
