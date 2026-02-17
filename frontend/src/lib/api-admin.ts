/**
 * Admin API Service
 */

import api, { ApiResponse } from './api';
import type {
  AdminStats,
  ActivityLog,
  ActivityLogFilters,
  AdminUser,
  CreateUserData,
  UpdateUserData,
  Tool,
  CreateToolData,
  UpdateToolData,
  PaginatedResponse,
  UserGrowthData,
} from '@/types/api';

export const adminApi = {
  // ============ Stats ============
  async getStats(): Promise<AdminStats> {
    const response = await api.get<ApiResponse<{ data: AdminStats }>>('/admin/stats');
    return response.data.data;
  },

  async getUserGrowth(): Promise<UserGrowthData> {
    const response = await api.get<ApiResponse<{ data: UserGrowthData }>>(
      '/admin/stats/user-growth'
    );
    return response.data.data;
  },

  async exportStats(format: 'pdf' | 'xlsx' = 'xlsx'): Promise<Blob> {
    const response = await api.get('/admin/stats/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  async exportStatsPdf(): Promise<Blob> {
    return this.exportStats('pdf');
  },

  async exportStatsXlsx(): Promise<Blob> {
    return this.exportStats('xlsx');
  },

  // ============ Activity Logs ============
  async getLogs(filters?: ActivityLogFilters, page = 1): Promise<PaginatedResponse<ActivityLog>> {
    const params = { ...filters, page };
    const response = await api.get<PaginatedResponse<ActivityLog>>('/admin/logs', { params });
    return response.data;
  },

  // ============ Users ============
  async getUsers(search?: string): Promise<AdminUser[]> {
    const params: Record<string, unknown> = {};
    if (search) params.search = search;
    const response = await api.get<ApiResponse<{ data: AdminUser[] }>>('/admin/users', { params });
    return response.data.data;
  },

  async createUser(data: CreateUserData): Promise<AdminUser> {
    const response = await api.post<ApiResponse<{ data: AdminUser }>>('/admin/users', data);
    return response.data.data;
  },

  async updateUser(userId: number, data: UpdateUserData): Promise<AdminUser> {
    const response = await api.put<ApiResponse<{ data: AdminUser }>>(
      `/admin/users/${userId}`,
      data
    );
    return response.data.data;
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  async exportUsers(format: 'pdf' | 'xlsx' = 'xlsx'): Promise<Blob> {
    const response = await api.get('/admin/users/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  async exportUsersPdf(): Promise<Blob> {
    return this.exportUsers('pdf');
  },

  async exportUsersXlsx(): Promise<Blob> {
    return this.exportUsers('xlsx');
  },

  // ============ Tools ============
  async getTools(): Promise<Tool[]> {
    const response = await api.get<ApiResponse<{ data: Tool[] }>>('/admin/tools');
    return response.data.data;
  },

  async createTool(data: CreateToolData): Promise<Tool> {
    const response = await api.post<ApiResponse<{ data: Tool }>>('/admin/tools', data);
    return response.data.data;
  },

  async updateTool(toolId: number, data: UpdateToolData): Promise<Tool> {
    const response = await api.put<ApiResponse<{ data: Tool }>>(`/admin/tools/${toolId}`, data);
    return response.data.data;
  },

  async deleteTool(toolId: number): Promise<void> {
    await api.delete(`/admin/tools/${toolId}`);
  },

  async exportTools(format: 'pdf' | 'xlsx' = 'xlsx'): Promise<Blob> {
    const response = await api.get('/admin/tools/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  async exportToolsPdf(): Promise<Blob> {
    return this.exportTools('pdf');
  },

  async exportToolsXlsx(): Promise<Blob> {
    return this.exportTools('xlsx');
  },
};

export default adminApi;
