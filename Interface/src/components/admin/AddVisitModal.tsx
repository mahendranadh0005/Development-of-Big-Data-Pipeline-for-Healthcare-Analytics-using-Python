import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/DataContext';
import { toast } from '@/hooks/use-toast';
import { Visit } from '@/types/hospital';
import { Search } from 'lucide-react';

interface AddVisitModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddVisitModal({ open, onClose }: AddVisitModalProps) {
  const { addVisit, generateVisitId, patients, doctors, getVisitsByPatient } = useData();
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [formData, setFormData] = useState<Partial<Visit>>({
    visit_id: '',
    patient_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    severity_score: 0,
    visit_type: 'OP',
    length_of_stay: 0,
    lab_result_glucose: undefined,
    lab_result_bp: '',
    previous_visit_gap_days: 0,
    readmitted_within_30_days: 'N/A',
    visit_cost: undefined,
    doctor_name: '',
    doctor_speciality: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData(prev => ({ ...prev, visit_id: generateVisitId() }));
      setPatientSearch('');
      setErrors({});
    }
  }, [open, generateVisitId]);

  // Auto-calculate previous visit gap
  useEffect(() => {
    if (formData.patient_id && formData.visit_date) {
      const patientVisits = getVisitsByPatient(formData.patient_id);
      if (patientVisits.length > 0) {
        const lastVisit = patientVisits
          .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())[0];
        const gap = Math.floor(
          (new Date(formData.visit_date).getTime() - new Date(lastVisit.visit_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        setFormData(prev => ({ ...prev, previous_visit_gap_days: Math.max(0, gap) }));
      }
    }
  }, [formData.patient_id, formData.visit_date, getVisitsByPatient]);

  // Auto-fill doctor speciality
  useEffect(() => {
    if (formData.doctor_name) {
      const doctor = doctors.find(d => d.doctor_name === formData.doctor_name);
      if (doctor) {
        setFormData(prev => ({ ...prev, doctor_speciality: doctor.doctor_speciality }));
      }
    }
  }, [formData.doctor_name, doctors]);

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const selectedPatient = patients.find(p => p.patient_id === formData.patient_id);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.visit_id) newErrors.visit_id = 'Visit ID is required';
    if (!formData.patient_id) newErrors.patient_id = 'Patient is required';
    if (!formData.visit_date) newErrors.visit_date = 'Visit date is required';
    if (formData.severity_score === undefined || formData.severity_score < 0 || formData.severity_score > 5) {
      newErrors.severity_score = 'Severity score must be 0-5';
    }
    if (!formData.visit_type) newErrors.visit_type = 'Visit type is required';
    if (formData.visit_type === 'IP' && (!formData.length_of_stay || formData.length_of_stay < 1)) {
      newErrors.length_of_stay = 'Length of stay required for IP';
    }
    if (!formData.lab_result_glucose) newErrors.lab_result_glucose = 'Glucose result is required';
    if (!formData.lab_result_bp) newErrors.lab_result_bp = 'BP result is required';
    if (!formData.visit_cost) newErrors.visit_cost = 'Visit cost is required';
    if (!formData.doctor_name) newErrors.doctor_name = 'Doctor is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const result = addVisit(formData as Visit);
    if (result.success) {
      toast({
        title: 'Visit Added',
        description: `Visit ${formData.visit_id} has been recorded successfully.`
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Visit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit_id">Visit ID</Label>
              <Input
                id="visit_id"
                value={formData.visit_id}
                onChange={(e) => setFormData({ ...formData, visit_id: e.target.value })}
                className={errors.visit_id ? 'border-destructive' : ''}
              />
              {errors.visit_id && <p className="text-xs text-destructive">{errors.visit_id}</p>}
            </div>

            <div className="space-y-2">
              <Label>Patient</Label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patient..."
                    value={selectedPatient ? selectedPatient.full_name : patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setFormData({ ...formData, patient_id: '' });
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className={`pl-10 ${errors.patient_id ? 'border-destructive' : ''}`}
                  />
                </div>
                {showPatientDropdown && filteredPatients.length > 0 && !selectedPatient && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredPatients.slice(0, 10).map(patient => (
                      <button
                        key={patient.patient_id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-muted text-sm"
                        onClick={() => {
                          setFormData({ ...formData, patient_id: patient.patient_id });
                          setShowPatientDropdown(false);
                        }}
                      >
                        <span className="font-medium">{patient.full_name}</span>
                        <span className="text-muted-foreground ml-2">({patient.patient_id})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.patient_id && <p className="text-xs text-destructive">{errors.patient_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit_date">Visit Date</Label>
              <Input
                id="visit_date"
                type="date"
                value={formData.visit_date}
                onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                className={errors.visit_date ? 'border-destructive' : ''}
              />
              {errors.visit_date && <p className="text-xs text-destructive">{errors.visit_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity_score">Severity Score (0-5)</Label>
              <Input
                id="severity_score"
                type="number"
                min="0"
                max="5"
                value={formData.severity_score ?? ''}
                onChange={(e) => setFormData({ ...formData, severity_score: parseInt(e.target.value) || 0 })}
                className={errors.severity_score ? 'border-destructive' : ''}
              />
              {errors.severity_score && <p className="text-xs text-destructive">{errors.severity_score}</p>}
            </div>

            <div className="space-y-2">
              <Label>Visit Type</Label>
              <Select
                value={formData.visit_type}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  visit_type: value as 'OP' | 'IP',
                  length_of_stay: value === 'OP' ? 0 : formData.length_of_stay,
                  readmitted_within_30_days: value === 'OP' ? 'N/A' : formData.readmitted_within_30_days
                })}
              >
                <SelectTrigger className={errors.visit_type ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OP">Outpatient (OP)</SelectItem>
                  <SelectItem value="IP">Inpatient (IP)</SelectItem>
                </SelectContent>
              </Select>
              {errors.visit_type && <p className="text-xs text-destructive">{errors.visit_type}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length_of_stay">Length of Stay (days)</Label>
              <Input
                id="length_of_stay"
                type="number"
                min="0"
                value={formData.length_of_stay ?? 0}
                onChange={(e) => setFormData({ ...formData, length_of_stay: parseInt(e.target.value) || 0 })}
                disabled={formData.visit_type === 'OP'}
                className={errors.length_of_stay ? 'border-destructive' : ''}
              />
              {errors.length_of_stay && <p className="text-xs text-destructive">{errors.length_of_stay}</p>}
            </div>

            <div className="space-y-2">
              <Label>Readmitted within 30 days</Label>
              <Select
                value={formData.readmitted_within_30_days}
                onValueChange={(value) => setFormData({ ...formData, readmitted_within_30_days: value as 'Yes' | 'No' | 'N/A' })}
                disabled={formData.visit_type === 'OP'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="N/A">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lab_result_glucose">Glucose (mg/dL)</Label>
              <Input
                id="lab_result_glucose"
                type="number"
                step="0.1"
                value={formData.lab_result_glucose ?? ''}
                onChange={(e) => setFormData({ ...formData, lab_result_glucose: parseFloat(e.target.value) || undefined })}
                className={errors.lab_result_glucose ? 'border-destructive' : ''}
              />
              {errors.lab_result_glucose && <p className="text-xs text-destructive">{errors.lab_result_glucose}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lab_result_bp">Blood Pressure</Label>
              <Input
                id="lab_result_bp"
                placeholder="120/80"
                value={formData.lab_result_bp}
                onChange={(e) => setFormData({ ...formData, lab_result_bp: e.target.value })}
                className={errors.lab_result_bp ? 'border-destructive' : ''}
              />
              {errors.lab_result_bp && <p className="text-xs text-destructive">{errors.lab_result_bp}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="previous_visit_gap_days">Previous Visit Gap (days)</Label>
              <Input
                id="previous_visit_gap_days"
                type="number"
                value={formData.previous_visit_gap_days ?? 0}
                onChange={(e) => setFormData({ ...formData, previous_visit_gap_days: parseInt(e.target.value) || 0 })}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit_cost">Visit Cost ($)</Label>
              <Input
                id="visit_cost"
                type="number"
                step="0.01"
                value={formData.visit_cost ?? ''}
                onChange={(e) => setFormData({ ...formData, visit_cost: parseFloat(e.target.value) || undefined })}
                className={errors.visit_cost ? 'border-destructive' : ''}
              />
              {errors.visit_cost && <p className="text-xs text-destructive">{errors.visit_cost}</p>}
            </div>

            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select
                value={formData.doctor_name}
                onValueChange={(value) => setFormData({ ...formData, doctor_name: value })}
              >
                <SelectTrigger className={errors.doctor_name ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.user_id} value={doctor.doctor_name}>
                      {doctor.doctor_name} ({doctor.doctor_speciality})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctor_name && <p className="text-xs text-destructive">{errors.doctor_name}</p>}
            </div>
          </div>

          {formData.doctor_speciality && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm"><strong>Doctor Speciality:</strong> {formData.doctor_speciality}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Add Visit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
