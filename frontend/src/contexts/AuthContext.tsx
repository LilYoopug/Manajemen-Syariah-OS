/**
 * Authentication Context
 * Manages user authentication state and provides auth functions
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenManager, getErrorMessage } from '@/lib/api';
import type { User, LoginCredentials, RegisterData, AuthResponse, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: tokenManager.get(),
    isAuthenticated: false,
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Fetch current user on mount (if token exists)
  const fetchUser = useCallback(async () => {
    const token = tokenManager.get();
    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const response = await api.get<{ data: User }>('/profile');
      setState({
        user: response.data.data,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // Token invalid - clear it
      tokenManager.remove();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Listen for unauthorized events (from API interceptor)
  useEffect(() => {
    const handleUnauthorized = () => {
      tokenManager.remove();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null);
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { token, data: user } = response.data;

      tokenManager.set(token);
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    setError(null);
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { token, data: user } = response.data;

      tokenManager.set(token);
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      tokenManager.remove();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  // Update user (for profile updates)
  const updateUser = useCallback((updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
