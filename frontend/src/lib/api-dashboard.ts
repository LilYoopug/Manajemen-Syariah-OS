/**
 * Dashboard API Service
 */

import api, { ApiResponse } from './api';
import type { DashboardData } from '@/types/api';

export const dashboardApi = {
  // Get dashboard data
  async get(): Promise<DashboardData> {
    const response = await api.get<ApiResponse<{ data: DashboardData }>>('/dashboard');
    return response.data.data;
  },
};

export default dashboardApi;
