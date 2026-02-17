/**
 * Directory API Service
 */

import api, { ApiResponse } from './api';
import type { DirectoryItem, CreateDirectoryData, UpdateDirectoryData } from '@/types/api';

export const directoryApi = {
  // Get directory tree
  async getAll(): Promise<DirectoryItem[]> {
    const response = await api.get<ApiResponse<{ data: DirectoryItem[] }>>('/directory');
    return response.data.data;
  },

  // Create directory item
  async create(data: CreateDirectoryData): Promise<DirectoryItem> {
    const response = await api.post<ApiResponse<{ data: DirectoryItem }>>('/directory', data);
    return response.data.data;
  },

  // Update directory item
  async update(id: number, data: UpdateDirectoryData): Promise<DirectoryItem> {
    const response = await api.put<ApiResponse<{ data: DirectoryItem }>>(`/directory/${id}`, data);
    return response.data.data;
  },

  // Delete directory item
  async delete(id: number): Promise<void> {
    await api.delete(`/directory/${id}`);
  },
};

export default directoryApi;
