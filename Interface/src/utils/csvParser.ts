import { Patient, Visit, Prescription } from '@/types/hospital';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  data: any[];
}

export function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });
}

export function validatePatientCSV(rows: string[][]): ValidationResult {
  const headers = rows[0]?.map(h => h.toLowerCase().trim());
  const requiredColumns = [
    'patient_id', 'full_name', 'age', 'gender', 'blood_group', 
    'phone_number', 'email', 'emergency_contact', 'hospital_location', 
    'bmi', 'smoker_status', 'alcohol_use', 'chronic_conditions', 
    'registration_date', 'insurance_type'
  ];

  const errors: string[] = [];
  const data: Partial<Patient>[] = [];

  // Validate columns
  const missingColumns = requiredColumns.filter(col => !headers?.includes(col));
  if (missingColumns.length > 0) {
    errors.push(`Missing columns: ${missingColumns.join(', ')}`);
    return { valid: false, errors, data: [] };
  }

  const columnIndexes: Record<string, number> = {};
  requiredColumns.forEach(col => {
    columnIndexes[col] = headers.indexOf(col);
  });

  // Validate each row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowErrors: string[] = [];

    const age = parseInt(row[columnIndexes.age]);
    if (isNaN(age) || age < 0 || age > 150) {
      rowErrors.push('Invalid age');
    }

    const gender = row[columnIndexes.gender];
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      rowErrors.push('Invalid gender (must be Male, Female, or Other)');
    }

    const bmi = parseFloat(row[columnIndexes.bmi]);
    if (isNaN(bmi) || bmi < 10 || bmi > 60) {
      rowErrors.push('Invalid BMI');
    }

    const smokerStatus = row[columnIndexes.smoker_status];
    if (!['Yes', 'No'].includes(smokerStatus)) {
      rowErrors.push('Invalid smoker_status (must be Yes or No)');
    }

    const alcoholUse = row[columnIndexes.alcohol_use];
    if (!['Yes', 'No'].includes(alcoholUse)) {
      rowErrors.push('Invalid alcohol_use (must be Yes or No)');
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${i + 1}: ${rowErrors.join('; ')}`);
    } else {
      data.push({
        patient_id: row[columnIndexes.patient_id],
        full_name: row[columnIndexes.full_name],
        age,
        gender: gender as 'Male' | 'Female' | 'Other',
        blood_group: row[columnIndexes.blood_group],
        phone_number: row[columnIndexes.phone_number],
        email: row[columnIndexes.email],
        emergency_contact: row[columnIndexes.emergency_contact],
        hospital_location: row[columnIndexes.hospital_location],
        bmi,
        smoker_status: smokerStatus as 'Yes' | 'No',
        alcohol_use: alcoholUse as 'Yes' | 'No',
        chronic_conditions: row[columnIndexes.chronic_conditions]?.split(';').map(s => s.trim()) || [],
        registration_date: row[columnIndexes.registration_date],
        insurance_type: row[columnIndexes.insurance_type]
      });
    }
  }

  return { valid: errors.length === 0, errors, data: data as Patient[] };
}

export function validateVisitCSV(rows: string[][]): ValidationResult {
  const headers = rows[0]?.map(h => h.toLowerCase().trim());
  const requiredColumns = [
    'visit_id', 'patient_id', 'visit_date', 'severity_score', 'visit_type',
    'length_of_stay', 'lab_result_glucose', 'lab_result_bp', 'previous_visit_gap_days',
    'readmitted_within_30_days', 'visit_cost', 'doctor_name', 'doctor_speciality'
  ];

  const errors: string[] = [];
  const data: Partial<Visit>[] = [];

  const missingColumns = requiredColumns.filter(col => !headers?.includes(col));
  if (missingColumns.length > 0) {
    errors.push(`Missing columns: ${missingColumns.join(', ')}`);
    return { valid: false, errors, data: [] };
  }

  const columnIndexes: Record<string, number> = {};
  requiredColumns.forEach(col => {
    columnIndexes[col] = headers.indexOf(col);
  });

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowErrors: string[] = [];

    const severityScore = parseInt(row[columnIndexes.severity_score]);
    if (isNaN(severityScore) || severityScore < 0 || severityScore > 5) {
      rowErrors.push('Invalid severity_score (must be 0-5)');
    }

    const visitType = row[columnIndexes.visit_type];
    if (!['OP', 'IP'].includes(visitType)) {
      rowErrors.push('Invalid visit_type (must be OP or IP)');
    }

    const lengthOfStay = parseInt(row[columnIndexes.length_of_stay]);
    if (isNaN(lengthOfStay) || lengthOfStay < 0) {
      rowErrors.push('Invalid length_of_stay');
    }

    const glucose = parseFloat(row[columnIndexes.lab_result_glucose]);
    if (isNaN(glucose)) {
      rowErrors.push('Invalid lab_result_glucose');
    }

    const visitCost = parseFloat(row[columnIndexes.visit_cost]);
    if (isNaN(visitCost) || visitCost < 0) {
      rowErrors.push('Invalid visit_cost');
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${i + 1}: ${rowErrors.join('; ')}`);
    } else {
      data.push({
        visit_id: row[columnIndexes.visit_id],
        patient_id: row[columnIndexes.patient_id],
        visit_date: row[columnIndexes.visit_date],
        severity_score: severityScore,
        visit_type: visitType as 'OP' | 'IP',
        length_of_stay: lengthOfStay,
        lab_result_glucose: glucose,
        lab_result_bp: row[columnIndexes.lab_result_bp],
        previous_visit_gap_days: parseInt(row[columnIndexes.previous_visit_gap_days]) || 0,
        readmitted_within_30_days: row[columnIndexes.readmitted_within_30_days] as 'Yes' | 'No' | 'N/A',
        visit_cost: visitCost,
        doctor_name: row[columnIndexes.doctor_name],
        doctor_speciality: row[columnIndexes.doctor_speciality]
      });
    }
  }

  return { valid: errors.length === 0, errors, data: data as Visit[] };
}

export function validatePrescriptionCSV(rows: string[][]): ValidationResult {
  const headers = rows[0]?.map(h => h.toLowerCase().trim());
  const requiredColumns = [
    'prescription_id', 'visit_id', 'patient_id', 'diagnosis_id', 'diagnosis_description',
    'drug_name', 'dosage', 'quantity', 'days_supply', 'prescribed_date', 'drug_category', 'cost'
  ];

  const errors: string[] = [];
  const data: Partial<Prescription>[] = [];

  const missingColumns = requiredColumns.filter(col => !headers?.includes(col));
  if (missingColumns.length > 0) {
    errors.push(`Missing columns: ${missingColumns.join(', ')}`);
    return { valid: false, errors, data: [] };
  }

  const columnIndexes: Record<string, number> = {};
  requiredColumns.forEach(col => {
    columnIndexes[col] = headers.indexOf(col);
  });

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowErrors: string[] = [];

    const quantity = parseInt(row[columnIndexes.quantity]);
    if (isNaN(quantity) || quantity < 0) {
      rowErrors.push('Invalid quantity');
    }

    const daysSupply = parseInt(row[columnIndexes.days_supply]);
    if (isNaN(daysSupply) || daysSupply < 0) {
      rowErrors.push('Invalid days_supply');
    }

    const cost = parseFloat(row[columnIndexes.cost]);
    if (isNaN(cost) || cost < 0) {
      rowErrors.push('Invalid cost');
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${i + 1}: ${rowErrors.join('; ')}`);
    } else {
      data.push({
        prescription_id: row[columnIndexes.prescription_id],
        visit_id: row[columnIndexes.visit_id],
        patient_id: row[columnIndexes.patient_id],
        diagnosis_id: row[columnIndexes.diagnosis_id],
        diagnosis_description: row[columnIndexes.diagnosis_description],
        drug_name: row[columnIndexes.drug_name],
        dosage: row[columnIndexes.dosage],
        quantity,
        days_supply: daysSupply,
        prescribed_date: row[columnIndexes.prescribed_date],
        drug_category: row[columnIndexes.drug_category],
        cost,
        doctor_name: ''
      });
    }
  }

  return { valid: errors.length === 0, errors, data: data as Prescription[] };
}
