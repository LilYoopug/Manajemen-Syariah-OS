/**
 * API Services - Unified Export
 */

export { default as api, tokenManager, getErrorMessage } from './api';
export type { ApiResponse, PaginatedResponse } from './api';

// Domain services
export { tasksApi, categoriesApi } from './api-tasks';
export { toolsApi } from './api-tools';
export { aiApi } from './api-ai';
export { adminApi } from './api-admin';
export { profileApi } from './api-profile';
export { dashboardApi } from './api-dashboard';
export { directoryApi } from './api-directory';
