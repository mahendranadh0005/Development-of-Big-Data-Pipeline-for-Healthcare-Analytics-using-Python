export interface User {
  userId: string;
  password: string;
  role: 'admin' | 'doctor';
  name: string;
  speciality?: string;
}

export interface Patient {
  patient_id: string;
  full_name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: string;
  phone_number: string;
  email: string;
  emergency_contact: string;
  hospital_location: string;
  bmi: number;
  smoker_status: 'Yes' | 'No';
  alcohol_use: 'Yes' | 'No';
  chronic_conditions: string[];
  registration_date: string;
  insurance_type: string;
}

export interface Visit {
  visit_id: string;
  patient_id: string;
  visit_date: string;
  severity_score: number;
  visit_type: 'OP' | 'IP';
  length_of_stay: number;
  lab_result_glucose: number;
  lab_result_bp: string;
  previous_visit_gap_days: number;
  readmitted_within_30_days: 'Yes' | 'No' | 'N/A';
  visit_cost: number;
  doctor_name: string;
  doctor_speciality: string;
}

export interface Doctor {
  doctor_name: string;
  user_id: string;
  password: string;
  doctor_speciality: string;
}

export interface Prescription {
  prescription_id: string;
  visit_id: string;
  patient_id: string;
  diagnosis_id: string;
  diagnosis_description: string;
  drug_name: string;
  dosage: string;
  quantity: number;
  days_supply: number;
  prescribed_date: string;
  drug_category: string;
  cost: number;
  doctor_name: string;
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const CHRONIC_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Asthma',
  'Arthritis',
  'COPD',
  'Kidney Disease',
  'Liver Disease',
  'Cancer',
  'Thyroid Disorder'
];

export const DRUG_CATEGORIES: Record<string, { drugs: string[]; category: string }> = {
  Cardiology: {
    drugs: ['Aspirin', 'Atorvastatin', 'Metoprolol', 'Lisinopril', 'Amlodipine', 'Warfarin', 'Clopidogrel', 'Digoxin', 'Furosemide', 'Spironolactone', 'Carvedilol', 'Valsartan', 'Nitroglycerin', 'Hydralazine', 'Amiodarone'],
    category: 'Cardiovascular'
  },
  Neurology: {
    drugs: ['Levetiracetam', 'Gabapentin', 'Pregabalin', 'Carbamazepine', 'Phenytoin', 'Valproate', 'Topiramate', 'Lamotrigine', 'Sumatriptan', 'Rizatriptan', 'Memantine', 'Donepezil', 'Ropinirole', 'Pramipexole', 'Baclofen'],
    category: 'Neurological'
  },
  Orthopedics: {
    drugs: ['Ibuprofen', 'Naproxen', 'Celecoxib', 'Meloxicam', 'Diclofenac', 'Tramadol', 'Acetaminophen', 'Cyclobenzaprine', 'Methocarbamol', 'Tizanidine', 'Alendronate', 'Risedronate', 'Calcium Carbonate', 'Vitamin D3', 'Colchicine'],
    category: 'Musculoskeletal'
  },
  Pediatrics: {
    drugs: ['Amoxicillin', 'Azithromycin', 'Cetirizine', 'Loratadine', 'Albuterol', 'Fluticasone', 'Montelukast', 'Ondansetron', 'Ranitidine', 'Omeprazole', 'Diphenhydramine', 'Guaifenesin', 'Dextromethorphan', 'Ibuprofen Pediatric', 'Acetaminophen Pediatric'],
    category: 'Pediatric'
  },
  General: {
    drugs: ['Metformin', 'Lisinopril', 'Omeprazole', 'Losartan', 'Levothyroxine', 'Simvastatin', 'Prednisone', 'Pantoprazole', 'Ciprofloxacin', 'Metronidazole', 'Doxycycline', 'Fluconazole', 'Clindamycin', 'Sulfamethoxazole', 'Levofloxacin'],
    category: 'General Medicine'
  }
};

export const DOCTOR_SPECIALITIES = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'General'
];
