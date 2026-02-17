/**
 * API Types - Matching Backend Resources
 */

// ============ Task Types ============
export type ResetCycle = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface TaskHistory {
  id: number;
  taskId: number;
  value: number;
  note: string | null;
  timestamp: string;
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  category: string | null;
  progress: number;
  hasLimit: boolean;
  currentValue: number;
  targetValue: number | null;
  unit: string | null;
  resetCycle: ResetCycle;
  perCheckEnabled: boolean;
  incrementValue: number;
  lastResetAt: string | null;
  createdAt: string;
  updatedAt: string;
  history?: TaskHistory[];
}

export interface CreateTaskData {
  text: string;
  category?: string;
  resetCycle?: ResetCycle;
  hasLimit?: boolean;
  targetValue?: number;
  unit?: string;
  incrementValue?: number;
  perCheckEnabled?: boolean;
}

export interface UpdateTaskData {
  text?: string;
  category?: string;
  resetCycle?: ResetCycle;
  hasLimit?: boolean;
  targetValue?: number;
  unit?: string;
  incrementValue?: number;
  perCheckEnabled?: boolean;
}

export interface TaskFilters {
  category?: string;
  search?: string;
  cycle?: ResetCycle;
}

// ============ Category Types ============
export interface Category {
  id: number;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============ Dashboard Types ============
export interface DashboardKpi {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  tasksByCategory: Record<string, number>;
  kepatuhanSyariahScore: number;
}

export interface DashboardGoal {
  id: string;
  title: string;
  target: number;
  progress: number;
  unit: string;
  percentage?: number;
  resetCycle?: ResetCycle;
}

export interface DashboardData {
  kpi: DashboardKpi;
  goals: DashboardGoal[];
  overallProgress: number;
  chartTrend: {
    labels: string[];
    values: number[];
  };
}

// ============ Directory Types ============

export type SourceType = 'quran' | 'hadith' | 'website' | 'none';

export interface QuranSource {
  type: 'quran';
  surah: number;
  verse: number;
  // Resolved fields (from API)
  surah_name?: string;
  surah_name_arabic?: string;
  arabic?: string;
  translation?: string;
}

export interface HadithSource {
  type: 'hadith';
  book: string;
  number: number;
  // Resolved fields (from API)
  book_name?: string;
  arabic?: string;
  translation?: string;
}

export interface WebsiteSource {
  type: 'website';
  title: string;
  url: string;
}

export interface NoneSource {
  type: 'none';
}

export type Source = QuranSource | HadithSource | WebsiteSource | NoneSource;

export interface DirectoryItem {
  id: number;
  title: string;
  sources?: Source[];
  explanation?: string;
  children?: DirectoryItem[];
}

export interface CreateDirectoryData {
  title: string;
  type: 'folder' | 'item';
  parentId?: number;
  content?: {
    sources?: Source[];
    explanation?: string;
  };
}

export interface UpdateDirectoryData {
  title?: string;
  parentId?: number | null;
  content?: {
    sources?: Source[];
    explanation?: string;
  } | null;
}

// ============ Tool Types ============
export interface Tool {
  id: number;
  name: string;
  category: string;
  description: string;
  inputs: string[];
  outputs: string[];
  benefits: string[];
  shariaBasis: string | null;
  link: string | null;
  relatedDirectoryIds: number[] | null;
  relatedDalilText: string | null;
  relatedDalilSource: string | null;
  sources?: Source[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateToolData {
  name: string;
  category: string;
  description: string;
  inputs: string;
  outputs: string;
  benefits: string;
  shariaBasis?: string;
  link?: string;
  relatedDirectoryIds?: number[];
  relatedDalilText?: string;
  relatedDalilSource?: string;
  sources?: Source[];
}

export interface UpdateToolData extends Partial<CreateToolData> {}

// ============ AI Types ============
export interface AiChatResponse {
  response: string;
}

export interface AiGeneratePlanData {
  goals: string;
  context?: string;
}

export interface AiInsightData {
  kpiData: Record<string, unknown>;
}

// ============ Admin Types ============
export interface AdminStats {
  totalUsers: number;
  totalTasks: number;
  completedTasks: number;
  activeUsers: number;
  recentActivity: ActivityLog[];
}
// ============ User Growth Types ============
export interface UserGrowthMonth {
  month: string;
  monthFull: string;
  newUsers: number;
  totalUsers: number;
  activeUsers: number;
  growthRate: number;
}

export interface UserGrowthSummary {
  totalNewUsers: number;
  avgGrowthRate: number;
  activeUsers: number;
}

export interface UserGrowthData {
  monthly: UserGrowthMonth[];
  summary: UserGrowthSummary;
}

export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  description: string | null;
  subjectType: string | null;
  subjectId: number | null;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ActivityLogFilters {
  action?: string;
  user_id?: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  theme: 'light' | 'dark';
  profilePicture: string | null;
  zakatRate: string;
  preferredAkad: string;
  calculationMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  theme?: 'light' | 'dark';
  profilePicture?: string;
  zakatRate?: number;
  preferredAkad?: string;
  calculationMethod?: 'Hijri' | 'Masehi';
}

// ============ Profile Types ============
export interface ProfileUpdateData {
  name?: string;
  theme?: 'light' | 'dark';
  profilePicture?: string;
  zakatRate?: number;
  preferredAkad?: string;
  calculationMethod?: 'Hijri' | 'Masehi';
}

// ============ Pagination Types ============
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}
