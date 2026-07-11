export type RoleName = 'admin' | 'doctor' | 'receptionist' | 'pharmacist';

export interface Role {
  id: number;
  name: RoleName;
  label: string;
  description: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: 'active' | 'inactive';
  role: Role;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}
