import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/DataContext';
import { toast } from '@/hooks/use-toast';
import { DOCTOR_SPECIALITIES } from '@/types/hospital';

interface AddDoctorModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddDoctorModal({ open, onClose }: AddDoctorModalProps) {
  const { addDoctor } = useData();
  const [formData, setFormData] = useState({
    doctor_name: '',
    user_id: '',
    password: '',
    doctor_speciality: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.doctor_name.trim()) newErrors.doctor_name = 'Doctor name is required';
    if (!formData.user_id.trim()) newErrors.user_id = 'User ID is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.doctor_speciality) newErrors.doctor_speciality = 'Speciality is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const result = addDoctor(formData);
    if (result.success) {
      toast({
        title: 'Doctor Added',
        description: `${formData.doctor_name} has been registered. They can now login with User ID: ${formData.user_id}`
      });
      setFormData({ doctor_name: '', user_id: '', password: '', doctor_speciality: '' });
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Doctor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctor_name">Doctor Name</Label>
            <Input
              id="doctor_name"
              placeholder="Dr. Jane Smith"
              value={formData.doctor_name}
              onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
              className={errors.doctor_name ? 'border-destructive' : ''}
            />
            {errors.doctor_name && <p className="text-xs text-destructive">{errors.doctor_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_id">User ID (for login)</Label>
            <Input
              id="user_id"
              placeholder="dr_smith"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className={errors.user_id ? 'border-destructive' : ''}
            />
            {errors.user_id && <p className="text-xs text-destructive">{errors.user_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label>Speciality</Label>
            <Select
              value={formData.doctor_speciality}
              onValueChange={(value) => setFormData({ ...formData, doctor_speciality: value })}
            >
              <SelectTrigger className={errors.doctor_speciality ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select speciality" />
              </SelectTrigger>
              <SelectContent>
                {DOCTOR_SPECIALITIES.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.doctor_speciality && <p className="text-xs text-destructive">{errors.doctor_speciality}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Add Doctor</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
