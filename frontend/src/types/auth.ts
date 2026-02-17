/**
 * Authentication Types - Matches Backend UserResource
 */

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  theme: 'light' | 'dark';
  profilePicture: string | null;
  zakatRate: number;
  preferredAkad: string;
  calculationMethod: 'Hijri' | 'Masehi';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  data: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
