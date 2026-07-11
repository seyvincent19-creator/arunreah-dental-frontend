import api from './axios';
import type { Appointment, AppointmentPayload, AppointmentStatus } from '../types/appointment';
import type { PaginatedResponse } from '../types/pagination';

export interface AppointmentListParams {
  page?: number;
  per_page?: number;
  search?: string;
  doctor_id?: number;
  patient_id?: number;
  status?: AppointmentStatus;
  date?: string;
  date_from?: string;
  date_to?: string;
}

export const listAppointments = (params: AppointmentListParams) =>
  api.get<PaginatedResponse<Appointment>>('/appointments', { params }).then((res) => res.data);

export const createAppointment = (payload: AppointmentPayload) =>
  api.post<{ appointment: Appointment }>('/appointments', payload).then((res) => res.data.appointment);

export const updateAppointment = (id: number, payload: Partial<AppointmentPayload>) =>
  api.put<{ appointment: Appointment }>(`/appointments/${id}`, payload).then((res) => res.data.appointment);

export const deleteAppointment = (id: number) => api.delete(`/appointments/${id}`).then((res) => res.data);

export const approveAppointment = (id: number) =>
  api.post<{ appointment: Appointment }>(`/appointments/${id}/approve`).then((res) => res.data.appointment);

export const cancelAppointment = (id: number, remark?: string) =>
  api
    .post<{ appointment: Appointment }>(`/appointments/${id}/cancel`, { remark })
    .then((res) => res.data.appointment);

export const completeAppointment = (id: number, remark?: string) =>
  api
    .post<{ appointment: Appointment }>(`/appointments/${id}/complete`, { remark })
    .then((res) => res.data.appointment);

export const checkInAppointment = (id: number) =>
  api.post<{ appointment: Appointment }>(`/appointments/${id}/check-in`).then((res) => res.data.appointment);
