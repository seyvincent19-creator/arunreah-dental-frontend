export interface TreatmentPatientSummary {
  id: number;
  patient_code: string;
  full_name: string;
}

export interface TreatmentDoctorSummary {
  id: number;
  doctor_code: string;
  doctor_name: string;
  specialization: string;
}

export interface Treatment {
  id: number;
  diagnosis: string;
  treatment: string;
  treatment_note: string | null;
  treatment_date: string;
  next_visit_date: string | null;
  patient: TreatmentPatientSummary;
  doctor: TreatmentDoctorSummary;
  appointment_id: number | null;
  created_by: string | null;
  created_at: string;
}

export interface TreatmentPayload {
  patient_id: number;
  doctor_id: number;
  appointment_id?: number | null;
  diagnosis: string;
  treatment: string;
  treatment_note?: string | null;
  treatment_date: string;
  next_visit_date?: string | null;
}
