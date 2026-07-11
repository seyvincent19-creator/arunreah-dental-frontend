import api from './axios';
import type { Treatment, TreatmentPayload } from '../types/treatment';
import type { PaginatedResponse } from '../types/pagination';

export interface TreatmentListParams {
  page?: number;
  per_page?: number;
  search?: string;
  patient_id?: number;
  doctor_id?: number;
}

export const listTreatments = (params: TreatmentListParams) =>
  api.get<PaginatedResponse<Treatment>>('/treatments', { params }).then((res) => res.data);

export const createTreatment = (payload: TreatmentPayload) =>
  api.post<{ treatment: Treatment }>('/treatments', payload).then((res) => res.data.treatment);

export const updateTreatment = (id: number, payload: Partial<TreatmentPayload>) =>
  api.put<{ treatment: Treatment }>(`/treatments/${id}`, payload).then((res) => res.data.treatment);

export const deleteTreatment = (id: number) => api.delete(`/treatments/${id}`).then((res) => res.data);
