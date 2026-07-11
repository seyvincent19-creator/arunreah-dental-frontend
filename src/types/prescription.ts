export type PrescriptionStatus = 'pending' | 'dispensed';

export interface PrescriptionItem {
  id: number;
  medicine_id: number;
  medicine_name: string;
  unit: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string | null;
  quantity: number;
}

export interface PrescriptionPatientSummary {
  id: number;
  patient_code: string;
  full_name: string;
}

export interface PrescriptionDoctorSummary {
  id: number;
  doctor_code: string;
  doctor_name: string;
}

export interface Prescription {
  id: number;
  prescription_date: string;
  note: string | null;
  status: PrescriptionStatus;
  dispensed_at: string | null;
  dispensed_by: string | null;
  patient: PrescriptionPatientSummary;
  doctor: PrescriptionDoctorSummary;
  treatment_id: number;
  items: PrescriptionItem[];
  created_at: string;
}

export interface PrescriptionItemPayload {
  medicine_id: number;
  dosage: string;
  frequency: string;
  duration: string;
  instruction?: string | null;
  quantity: number;
}

export interface PrescriptionPayload {
  treatment_id: number;
  patient_id: number;
  doctor_id: number;
  prescription_date: string;
  note?: string | null;
  items: PrescriptionItemPayload[];
}
