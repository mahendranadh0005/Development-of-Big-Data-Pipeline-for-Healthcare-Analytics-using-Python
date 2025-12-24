import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/DataContext';
import { toast } from '@/hooks/use-toast';
import { BLOOD_GROUPS, CHRONIC_CONDITIONS, Patient } from '@/types/hospital';
import { Check, ChevronRight, X } from 'lucide-react';

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddPatientModal({ open, onClose }: AddPatientModalProps) {
  const { addPatient, generatePatientId, isPatientIdUnique } = useData();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Patient>>({
    patient_id: '',
    full_name: '',
    age: undefined,
    gender: undefined,
    blood_group: '',
    phone_number: '',
    email: '',
    emergency_contact: '',
    hospital_location: '',
    bmi: undefined,
    smoker_status: undefined,
    alcohol_use: undefined,
    chronic_conditions: [],
    registration_date: new Date().toISOString().split('T')[0],
    insurance_type: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData(prev => ({ ...prev, patient_id: generatePatientId() }));
      setStep(1);
      setErrors({});
    }
  }, [open, generatePatientId]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient_id) newErrors.patient_id = 'Patient ID is required';
    else if (!isPatientIdUnique(formData.patient_id)) newErrors.patient_id = 'Patient ID already exists';
    if (!formData.full_name?.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.age || formData.age < 0 || formData.age > 150) newErrors.age = 'Valid age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.blood_group) newErrors.blood_group = 'Blood group is required';
    if (!formData.phone_number?.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (!formData.emergency_contact?.trim()) newErrors.emergency_contact = 'Emergency contact is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hospital_location?.trim()) newErrors.hospital_location = 'Hospital location is required';
    if (!formData.bmi || formData.bmi < 10 || formData.bmi > 60) newErrors.bmi = 'Valid BMI is required (10-60)';
    if (!formData.smoker_status) newErrors.smoker_status = 'Smoker status is required';
    if (!formData.alcohol_use) newErrors.alcohol_use = 'Alcohol use is required';
    if (!formData.registration_date) newErrors.registration_date = 'Registration date is required';
    if (!formData.insurance_type?.trim()) newErrors.insurance_type = 'Insurance type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = () => {
    if (!validateStep2()) return;

    const result = addPatient(formData as Patient);
    if (result.success) {
      toast({
        title: 'Patient Added',
        description: `Patient ${formData.full_name} has been registered successfully.`
      });
      onClose();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive'
      });
    }
  };

  const toggleCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions?.includes(condition)
        ? prev.chronic_conditions.filter(c => c !== condition)
        : [...(prev.chronic_conditions || []), condition]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Patient</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className={`form-step-indicator ${step === 1 ? 'form-step-active' : 'form-step-completed'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">Personal Details</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className={`form-step-indicator ${step === 2 ? 'form-step-active' : 'form-step-inactive'}`}>
              2
            </div>
            <span className="text-sm text-muted-foreground">Clinical & Registration</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4 fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_id">Patient ID</Label>
                <Input
                  id="patient_id"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className={errors.patient_id ? 'border-destructive' : ''}
                />
                {errors.patient_id && <p className="text-xs text-destructive">{errors.patient_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className={errors.full_name ? 'border-destructive' : ''}
                />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                  className={errors.age ? 'border-destructive' : ''}
                />
                {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as Patient['gender'] })}
                >
                  <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
              </div>

              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select
                  value={formData.blood_group}
                  onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                >
                  <SelectTrigger className={errors.blood_group ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.blood_group && <p className="text-xs text-destructive">{errors.blood_group}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className={errors.phone_number ? 'border-destructive' : ''}
                />
                {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className={errors.emergency_contact ? 'border-destructive' : ''}
              />
              {errors.emergency_contact && <p className="text-xs text-destructive">{errors.emergency_contact}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleNext}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hospital_location">Hospital Location</Label>
                <Input
                  id="hospital_location"
                  value={formData.hospital_location}
                  onChange={(e) => setFormData({ ...formData, hospital_location: e.target.value })}
                  className={errors.hospital_location ? 'border-destructive' : ''}
                />
                {errors.hospital_location && <p className="text-xs text-destructive">{errors.hospital_location}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmi">BMI</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.1"
                  value={formData.bmi || ''}
                  onChange={(e) => setFormData({ ...formData, bmi: parseFloat(e.target.value) || undefined })}
                  className={errors.bmi ? 'border-destructive' : ''}
                />
                {errors.bmi && <p className="text-xs text-destructive">{errors.bmi}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Smoker Status</Label>
                <Select
                  value={formData.smoker_status}
                  onValueChange={(value) => setFormData({ ...formData, smoker_status: value as 'Yes' | 'No' })}
                >
                  <SelectTrigger className={errors.smoker_status ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.smoker_status && <p className="text-xs text-destructive">{errors.smoker_status}</p>}
              </div>

              <div className="space-y-2">
                <Label>Alcohol Use</Label>
                <Select
                  value={formData.alcohol_use}
                  onValueChange={(value) => setFormData({ ...formData, alcohol_use: value as 'Yes' | 'No' })}
                >
                  <SelectTrigger className={errors.alcohol_use ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.alcohol_use && <p className="text-xs text-destructive">{errors.alcohol_use}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Chronic Conditions</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {CHRONIC_CONDITIONS.map(condition => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => toggleCondition(condition)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      formData.chronic_conditions?.includes(condition)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-foreground hover:bg-muted'
                    }`}
                  >
                    {condition}
                    {formData.chronic_conditions?.includes(condition) && (
                      <X className="w-3 h-3 inline ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration_date">Registration Date</Label>
                <Input
                  id="registration_date"
                  type="date"
                  value={formData.registration_date}
                  onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                  className={errors.registration_date ? 'border-destructive' : ''}
                />
                {errors.registration_date && <p className="text-xs text-destructive">{errors.registration_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance_type">Insurance Type</Label>
                <Input
                  id="insurance_type"
                  value={formData.insurance_type}
                  onChange={(e) => setFormData({ ...formData, insurance_type: e.target.value })}
                  className={errors.insurance_type ? 'border-destructive' : ''}
                />
                {errors.insurance_type && <p className="text-xs text-destructive">{errors.insurance_type}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleSubmit}>Add Patient</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
