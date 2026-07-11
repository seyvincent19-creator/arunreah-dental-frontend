import type { Gender } from './doctor';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Patient {
  id: number;
  patient_code: string;
  national_id: string | null;
  full_name: string;
  gender: Gender;
  date_of_birth: string;
  age: number | null;
  phone: string;
  email: string | null;
  address: string | null;
  emergency_contact: string | null;
  blood_group: BloodGroup | null;
  allergy: string | null;
  medical_history: string | null;
  status: 'active' | 'inactive';
  registered_by: string | null;
  created_at: string;
}

export interface PatientPayload {
  national_id?: string | null;
  full_name: string;
  gender: Gender;
  date_of_birth: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  blood_group?: BloodGroup | null;
  allergy?: string | null;
  medical_history?: string | null;
  status?: 'active' | 'inactive';
}
