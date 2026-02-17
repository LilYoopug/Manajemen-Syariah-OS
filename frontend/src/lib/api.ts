/**
 * API Client for SyariahOS Backend
 * Handles authentication, interceptors, and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'syariahos_token';

export const tokenManager = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  remove: (): void => localStorage.removeItem(TOKEN_KEY),
};

// Request interceptor - attach token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.get();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // On 401, clear token and redirect to login
    if (error.response?.status === 401) {
      tokenManager.remove();
      // Dispatch custom event for auth context to handle
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T> {
  message: string;
  data?: T;
  token?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Error extraction helper
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;
    if (data?.errors) {
      // Return first validation error
      const firstError = Object.values(data.errors)[0];
      return firstError[0] || data.message || 'An error occurred';
    }
    return data?.message || error.message || 'An error occurred';
  }
  return error instanceof Error ? error.message : 'An error occurred';
}

export default api;
