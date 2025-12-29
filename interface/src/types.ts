export interface Patient {
  patient_id: string;
  age: number;
  gender: string;
  location: string;
  bmi: number;
  smoker_status: 'yes' | 'no';
  alcohol_use: 'yes' | 'no';
  chronic_conditions: string;
  registration_date: string;
  insurance_type: 'gov' | 'private' | 'self-pay';
  full_name: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

export interface Visit {
  visit_id: string;
  patient_id: string;
  visit_date: string;
  diagnosis_code: string;
  diagnosis_description: string;
  severity_score: number;
  length_of_stay: number;
  lab_result_glucose: number;
  lab_result_bp: string;
  previous_visit_gap_days: number;
  readmitted_within_30_days: 'yes' | 'no';
  visit_cost: number;
  doctor_specialty: string;
}

export interface PatientFormData {
  full_name: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  location: string;
  bmi: string;
  smoker_status: 'yes' | 'no';
  alcohol_use: 'yes' | 'no';
  chronic_conditions: string[];
  insurance_type: 'gov' | 'private' | 'self-pay';
}
