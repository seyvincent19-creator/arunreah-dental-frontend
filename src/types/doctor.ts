export type Gender = 'male' | 'female' | 'other';

export interface Doctor {
  id: number;
  doctor_code: string;
  doctor_name: string;
  gender: Gender;
  specialization: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  user_id: number | null;
  created_at: string;
}

export interface DoctorPayload {
  doctor_name: string;
  gender: Gender;
  specialization: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}
