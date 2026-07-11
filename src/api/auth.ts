import api from './axios';
import type { LoginPayload, LoginResponse, User } from '../types/auth';

export const login = (payload: LoginPayload) =>
  api.post<LoginResponse>('/login', payload).then((res) => res.data);

export const logout = () => api.post('/logout').then((res) => res.data);

export const fetchProfile = () =>
  api.get<{ user: User }>('/profile').then((res) => res.data.user);

export const changePassword = (payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) => api.post('/change-password', payload).then((res) => res.data);

export const forgotPassword = (email: string) =>
  api.post('/forgot-password', { email }).then((res) => res.data);
