/**
 * Profile API Service
 */

import api, { ApiResponse } from './api';
import type { User } from '@/types/auth';
import type { ProfileUpdateData } from '@/types/api';

export const profileApi = {
  // Get current user profile
  async get(): Promise<User> {
    const response = await api.get<ApiResponse<{ data: User }>>('/profile');
    return response.data.data;
  },

  // Update profile
  async update(data: ProfileUpdateData): Promise<User> {
    const response = await api.put<ApiResponse<{ message: string; data: User }>>('/profile', data);
    return response.data.data;
  },

  // Export profile data
  async export(): Promise<Blob> {
    const response = await api.post(
      '/profile/export',
      {},
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // Reset profile (clear all user data)
  async reset(): Promise<void> {
    await api.post('/profile/reset');
  },
};

export default profileApi;
