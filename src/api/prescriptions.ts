import api from './axios';
import type { Prescription, PrescriptionPayload, PrescriptionStatus } from '../types/prescription';
import type { PaginatedResponse } from '../types/pagination';

export interface PrescriptionListParams {
  page?: number;
  per_page?: number;
  search?: string;
  patient_id?: number;
  doctor_id?: number;
  status?: PrescriptionStatus;
}

export const listPrescriptions = (params: PrescriptionListParams) =>
  api.get<PaginatedResponse<Prescription>>('/prescriptions', { params }).then((res) => res.data);

export const createPrescription = (payload: PrescriptionPayload) =>
  api.post<{ prescription: Prescription }>('/prescriptions', payload).then((res) => res.data.prescription);

export const updatePrescription = (id: number, payload: Partial<PrescriptionPayload>) =>
  api.put<{ prescription: Prescription }>(`/prescriptions/${id}`, payload).then((res) => res.data.prescription);

export const deletePrescription = (id: number) => api.delete(`/prescriptions/${id}`).then((res) => res.data);

export const dispensePrescription = (id: number) =>
  api.post<{ prescription: Prescription }>(`/prescriptions/${id}/dispense`).then((res) => res.data.prescription);
