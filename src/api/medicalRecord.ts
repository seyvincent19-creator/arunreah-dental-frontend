import api from './axios';
import type { MedicalRecord } from '../types/medicalRecord';

export const fetchMedicalRecord = (patientId: number) =>
  api.get<MedicalRecord>(`/patients/${patientId}/medical-record`).then((res) => res.data);
