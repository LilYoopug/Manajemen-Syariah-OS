
// FIX: Import React to resolve 'Cannot find namespace React' error.
import React from 'react';

export type View = 'landing' | 'login' | 'register' | 'dashboard' | 'tasks' | 'tools' | 'generator' | 'settings' | 'admin_dashboard' | 'admin_users' | 'admin_tools';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  lastLogin: string;
}

export interface DirectoryItem {
  id: string;
  title: string;
  dalil?: string;
  source?: string;
  explanation?: string;
  children?: DirectoryItem[];
  parentPath?: string; // For easier searching
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  inputs: string;
  outputs: string;
  benefits: string;
  shariaBasis?: string; // FIX: Added shariaBasis for direct text support
  relatedDalil?: { text: string; source: string };
  relatedDirectoryIds?: string[];
  icon: React.ElementType;
  link?: string;
  createdAt?: number; // Timestamp in milliseconds
}

export enum ToolCategory {
  Individu = "Individu/Keluarga",
  Bisnis = "Bisnis Islami",
  Lembaga = "Lembaga/Komunitas",
  Keuangan = "Keuangan/Investasi",
  Edukasi = "Edukasi",
  Sosial = "Sosial/Umat",
}

export interface Kpi {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  date: string; // ISO Date string for historical data
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  progress: number;
  unit: string;
  date: string; // ISO Date string for historical data
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export type ResetCycle = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// FIX: Added HistoryEntry interface for task tracking
export interface HistoryEntry {
  id: string;
  timestamp: string;
  value: number;
  note?: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
  progress?: number;
  dependencies?: string[];
  subtasks?: Subtask[];
  // Numeric target support
  hasLimit: boolean;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  // Recurring and Increment logic
  resetCycle: ResetCycle;
  perCheckEnabled: boolean;
  incrementValue?: number;
  lastResetAt?: string; // ISO String
  // FIX: Added history property to Task interface
  history: HistoryEntry[];
}

export interface UserProfile {
  name: string;
  zakatRate: number;
  preferredAkad: string;
  calculationMethod: 'Hijri' | 'Masehi';
  profilePicture?: string;
}