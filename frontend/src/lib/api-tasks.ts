/**
 * Tasks API Service
 */

import api, { ApiResponse } from './api';
import type {
  Task,
  TaskHistory,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  Category,
} from '@/types/api';

export const tasksApi = {
  // Get all tasks with optional filters
  async getAll(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.cycle) params.append('cycle', filters.cycle);

    const response = await api.get<ApiResponse<{ data: Task[] }>>('/tasks', { params });
    return response.data.data;
  },

  // Get single task with history
  async getById(id: number): Promise<Task> {
    const response = await api.get<ApiResponse<{ data: Task }>>(`/tasks/${id}`);
    return response.data.data;
  },

  // Create new task
  async create(data: CreateTaskData): Promise<Task> {
    const response = await api.post<ApiResponse<{ message: string; data: Task }>>('/tasks', data);
    return response.data.data;
  },

  // Update task
  async update(id: number, data: UpdateTaskData): Promise<Task> {
    const response = await api.put<ApiResponse<{ message: string; data: Task }>>(
      `/tasks/${id}`,
      data
    );
    return response.data.data;
  },

  // Toggle task completion
  async toggle(id: number): Promise<Task> {
    const response = await api.patch<ApiResponse<{ message: string; data: Task }>>(
      `/tasks/${id}/toggle`
    );
    return response.data.data;
  },

  // Add custom progress value to a task (for hasLimit tasks)
  async addProgress(id: number, value: number): Promise<Task> {
    const response = await api.post<ApiResponse<{ message: string; data: Task }>>(
      `/tasks/${id}/progress`,
      { value }
    );
    return response.data.data;
  },

  // Delete task
  async delete(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  // Update history entry
  async updateHistory(
    taskId: number,
    entryId: number,
    data: { value?: number; note?: string }
  ): Promise<TaskHistory> {
    const response = await api.put<ApiResponse<{ message: string; data: TaskHistory }>>(
      `/tasks/${taskId}/history/${entryId}`,
      data
    );
    return response.data.data;
  },

  // Delete history entry
  async deleteHistory(taskId: number, entryId: number): Promise<void> {
    await api.delete(`/tasks/${taskId}/history/${entryId}`);
  },
};

export const categoriesApi = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    const response = await api.get<ApiResponse<{ data: Category[] }>>('/categories');
    return response.data.data;
  },
};

export default tasksApi;
