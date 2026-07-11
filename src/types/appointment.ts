export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface AppointmentPatientSummary {
  id: number;
  patient_code: string;
  full_name: string;
  phone: string;
}

export interface AppointmentDoctorSummary {
  id: number;
  doctor_code: string;
  doctor_name: string;
  specialization: string;
}

export interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  purpose: string;
  status: AppointmentStatus;
  remark: string | null;
  checked_in_at: string | null;
  patient: AppointmentPatientSummary;
  doctor: AppointmentDoctorSummary;
  created_by: string | null;
  created_at: string;
}

export interface AppointmentPayload {
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  purpose: string;
  remark?: string | null;
}
