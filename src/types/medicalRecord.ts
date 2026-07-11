import type { Appointment } from './appointment';
import type { Patient } from './patient';
import type { Prescription } from './prescription';
import type { Treatment } from './treatment';

export interface MedicalRecord {
  patient: Patient;
  appointment_history: Appointment[];
  treatment_history: Treatment[];
  prescription_history: Prescription[];
}
