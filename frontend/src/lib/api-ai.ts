/**
 * AI API Service
 */

import api, { ApiResponse } from './api';
import type { AiGeneratePlanData, AiInsightData } from '@/types/api';

export interface AiChatResult {
  response: string;
}

export interface AiPlanResult {
  plan: string;
}

export interface AiInsightResult {
  insights: string;
}

export const aiApi = {
  // Chat with AI assistant
  async chat(message: string): Promise<AiChatResult> {
    const response = await api.post<ApiResponse<AiChatResult>>('/ai/chat', { message });
    return response.data.data;
  },

  // Generate strategic plan
  async generatePlan(data: AiGeneratePlanData): Promise<AiPlanResult> {
    const response = await api.post<ApiResponse<AiPlanResult>>('/ai/generate-plan', data);
    return response.data.data;
  },

  // Get insights from KPI data
  async insight(data: AiInsightData): Promise<AiInsightResult> {
    const response = await api.post<ApiResponse<AiInsightResult>>('/ai/insight', data);
    return response.data.data;
  },
};

export default aiApi;
