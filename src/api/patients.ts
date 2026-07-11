import api from './axios';
import type { Patient, PatientPayload } from '../types/patient';
import type { PaginatedResponse } from '../types/pagination';

export interface PatientListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}

export const listPatients = (params: PatientListParams) =>
  api.get<PaginatedResponse<Patient>>('/patients', { params }).then((res) => res.data);

export const createPatient = (payload: PatientPayload) =>
  api.post<{ patient: Patient }>('/patients', payload).then((res) => res.data.patient);

export const updatePatient = (id: number, payload: Partial<PatientPayload>) =>
  api.put<{ patient: Patient }>(`/patients/${id}`, payload).then((res) => res.data.patient);

export const deletePatient = (id: number) => api.delete(`/patients/${id}`).then((res) => res.data);
