import api from './axios';
import type { Doctor, DoctorPayload } from '../types/doctor';
import type { PaginatedResponse } from '../types/pagination';

export interface DoctorListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}

export const listDoctors = (params: DoctorListParams) =>
  api.get<PaginatedResponse<Doctor>>('/doctors', { params }).then((res) => res.data);

export const createDoctor = (payload: DoctorPayload) =>
  api.post<{ doctor: Doctor }>('/doctors', payload).then((res) => res.data.doctor);

export const updateDoctor = (id: number, payload: Partial<DoctorPayload>) =>
  api.put<{ doctor: Doctor }>(`/doctors/${id}`, payload).then((res) => res.data.doctor);

export const deleteDoctor = (id: number) => api.delete(`/doctors/${id}`).then((res) => res.data);
