import api from './axios';
import type { Medicine, MedicinePayload } from '../types/medicine';
import type { PaginatedResponse } from '../types/pagination';

export interface MedicineListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  low_stock?: boolean;
}

export const listMedicines = (params: MedicineListParams) =>
  api.get<PaginatedResponse<Medicine>>('/medicines', { params }).then((res) => res.data);

export const createMedicine = (payload: MedicinePayload) =>
  api.post<{ medicine: Medicine }>('/medicines', payload).then((res) => res.data.medicine);

export const updateMedicine = (id: number, payload: Partial<MedicinePayload>) =>
  api.put<{ medicine: Medicine }>(`/medicines/${id}`, payload).then((res) => res.data.medicine);

export const deleteMedicine = (id: number) => api.delete(`/medicines/${id}`).then((res) => res.data);
