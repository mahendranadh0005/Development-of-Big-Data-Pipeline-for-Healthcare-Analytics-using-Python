import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/DataContext';
import { toast } from '@/hooks/use-toast';
import { DRUG_CATEGORIES, Prescription } from '@/types/hospital';

interface AddPrescriptionModalProps {
  open: boolean;
  onClose: () => void;
  doctorName: string;
  doctorSpeciality: string;
}

export default function AddPrescriptionModal({ open, onClose, doctorName, doctorSpeciality }: AddPrescriptionModalProps) {
  const { addPrescription, generatePrescriptionId, getVisitsByDoctor, patients } = useData();
  const doctorVisits = getVisitsByDoctor(doctorName);
  
  const [formData, setFormData] = useState<Partial<Prescription>>({
    prescription_id: '',
    visit_id: '',
    patient_id: '',
    diagnosis_id: '',
    diagnosis_description: '',
    drug_name: '',
    dosage: '',
    quantity: undefined,
    days_supply: undefined,
    prescribed_date: new Date().toISOString().split('T')[0],
    drug_category: '',
    cost: undefined,
    doctor_name: doctorName
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const drugs = DRUG_CATEGORIES[doctorSpeciality]?.drugs || DRUG_CATEGORIES.General.drugs;
  const drugCategory = DRUG_CATEGORIES[doctorSpeciality]?.category || 'General Medicine';

  useEffect(() => {
    if (open) {
      setFormData(prev => ({ 
        ...prev, 
        prescription_id: generatePrescriptionId(),
        doctor_name: doctorName,
        drug_category: drugCategory
      }));
      setErrors({});
    }
  }, [open, generatePrescriptionId, doctorName, drugCategory]);

  useEffect(() => {
    if (formData.visit_id) {
      const visit = doctorVisits.find(v => v.visit_id === formData.visit_id);
      if (visit) {
        setFormData(prev => ({ ...prev, patient_id: visit.patient_id }));
      }
    }
  }, [formData.visit_id, doctorVisits]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.visit_id) newErrors.visit_id = 'Visit is required';
    if (!formData.diagnosis_id) newErrors.diagnosis_id = 'Diagnosis ID is required';
    if (!formData.diagnosis_description) newErrors.diagnosis_description = 'Description is required';
    if (!formData.drug_name) newErrors.drug_name = 'Drug is required';
    if (!formData.dosage) newErrors.dosage = 'Dosage is required';
    if (!formData.quantity || formData.quantity < 1) newErrors.quantity = 'Valid quantity required';
    if (!formData.days_supply || formData.days_supply < 1) newErrors.days_supply = 'Valid days supply required';
    if (!formData.cost || formData.cost < 0) newErrors.cost = 'Valid cost required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const result = addPrescription({ ...formData, drug_category: drugCategory } as Prescription);
    if (result.success) {
      toast({ title: 'Prescription Added', description: 'Prescription created successfully.' });
      onClose();
    }
  };

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
              <Select value={formData.visit_id} onValueChange={(v) => setFormData({ ...formData, visit_id: v })}>
                <SelectTrigger className={errors.visit_id ? 'border-destructive' : ''}><SelectValue placeholder="Select visit" /></SelectTrigger>
                <SelectContent>
                  {doctorVisits.map(v => {
                    const patient = patients.find(p => p.patient_id === v.patient_id);
                    return <SelectItem key={v.visit_id} value={v.visit_id}>{v.visit_id} - {patient?.full_name}</SelectItem>;
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
              <Input value={formData.diagnosis_id} onChange={(e) => setFormData({ ...formData, diagnosis_id: e.target.value })} className={errors.diagnosis_id ? 'border-destructive' : ''} />
            </div>
            <div className="space-y-2">
              <Label>Drug</Label>
              <Select value={formData.drug_name} onValueChange={(v) => setFormData({ ...formData, drug_name: v })}>
                <SelectTrigger className={errors.drug_name ? 'border-destructive' : ''}><SelectValue placeholder="Select drug" /></SelectTrigger>
                <SelectContent>{drugs.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Diagnosis Description</Label>
            <Input value={formData.diagnosis_description} onChange={(e) => setFormData({ ...formData, diagnosis_description: e.target.value })} className={errors.diagnosis_description ? 'border-destructive' : ''} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2"><Label>Dosage</Label><Input value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} placeholder="10mg" /></div>
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={formData.quantity ?? ''} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Days Supply</Label><Input type="number" value={formData.days_supply ?? ''} onChange={(e) => setFormData({ ...formData, days_supply: parseInt(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Cost ($)</Label><Input type="number" step="0.01" value={formData.cost ?? ''} onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Prescribed Date</Label><Input type="date" value={formData.prescribed_date} onChange={(e) => setFormData({ ...formData, prescribed_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Drug Category</Label><Input value={drugCategory} readOnly className="bg-muted" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Add Prescription</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
