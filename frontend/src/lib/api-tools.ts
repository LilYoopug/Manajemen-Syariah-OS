/**
 * Tools API Service
 */

import api, { ApiResponse } from './api';
import type { Tool } from '@/types/api';

export const toolsApi = {
  // Get all tools with optional category filter
  async getAll(category?: string): Promise<Tool[]> {
    const params = category ? { category } : undefined;
    const response = await api.get<ApiResponse<{ data: Tool[] }>>('/tools', { params });
    return response.data.data;
  },

  // Get single tool
  async getById(id: number): Promise<Tool> {
    const response = await api.get<ApiResponse<{ data: Tool }>>(`/tools/${id}`);
    return response.data.data;
  },
};

export default toolsApi;
