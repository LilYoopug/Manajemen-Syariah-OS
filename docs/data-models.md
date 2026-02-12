# Data Models: Manajemen Syariah OS

## TypeScript Type Definitions

Located in: `frontend/src/types/index.ts`

---

## Core Types

### View Type

Navigation views for the application.

```typescript
export type View = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'tasks' 
  | 'tools' 
  | 'generator' 
  | 'settings' 
  | 'admin_dashboard' 
  | 'admin_users' 
  | 'admin_tools';
```

**Usage:**
- Controls which view is displayed
- Passed to `Sidebar` and `App` components
- Used in navigation state

---

### UserRole Type

```typescript
export type UserRole = 'admin' | 'user';
```

**Storage:** `localStorage.getItem('syariahos_role')`

---

### User Interface

User profile data structure.

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  lastLogin: string;  // ISO Date string
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `email` | `string` | Email address |
| `role` | `UserRole` | Admin or user |
| `status` | `'active' \| 'suspended'` | Account status |
| `lastLogin` | `string` | ISO timestamp |

---

## Directory (Knowledge Base)

### DirectoryItem Interface

Hierarchical knowledge structure for Islamic teachings.

```typescript
export interface DirectoryItem {
  id: string;
  title: string;
  dalil?: string;           // Arabic/Quranic text
  source?: string;          // Source reference (e.g., "QS. An-Nisa: 58")
  explanation?: string;     // Detailed explanation
  children?: DirectoryItem[];  // Nested items
  parentPath?: string;      // Computed path for search
}
```

**Example Data:**
```typescript
{
  id: 'q1',
  title: 'Amanah (QS. An-Nisa: 58)',
  dalil: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا",
  source: "QS. An-Nisa: 58",
  explanation: "Prinsip dasar kepercayaan dan tanggung jawab...",
  children: []
}
```

**Storage:** `localStorage` key: `syariahos_directory_v2`

---

## Tools Catalog

### ToolCategory Enum

```typescript
export enum ToolCategory {
  Individu = "Individu/Keluarga",
  Bisnis = "Bisnis Islami",
  Lembaga = "Lembaga/Komunitas",
  Keuangan = "Keuangan/Investasi",
  Edukasi = "Edukasi",
  Sosial = "Sosial/Umat",
}
```

### Tool Interface

```typescript
export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  inputs: string;
  outputs: string;
  benefits: string;
  shariaBasis?: string;
  relatedDalil?: { 
    text: string; 
    source: string 
  };
  relatedDirectoryIds?: string[];
  icon: React.ElementType;
  link?: string;
  createdAt?: number;  // Timestamp in milliseconds
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique tool ID |
| `name` | `string` | Tool name |
| `category` | `ToolCategory` | Category classification |
| `description` | `string` | Short description |
| `inputs` | `string` | Required inputs |
| `outputs` | `string` | Expected outputs |
| `benefits` | `string` | Key benefits |
| `shariaBasis` | `string` | Sharia foundation text |
| `relatedDalil` | `object` | Related Quranic/Hadith reference |
| `relatedDirectoryIds` | `string[]` | Linked directory items |
| `icon` | `React.ElementType` | Lucide icon component |
| `link` | `string` | External tool URL |
| `createdAt` | `number` | Creation timestamp |

**Sample Tools:**
1. Financial Planner Syariah
2. Life Planner Islami
3. Zakat Manager Pro
4. Shariah Stock Screener
5. LMS Syariah
6. ... (25 total tools)

---

## Dashboard KPIs

### Kpi Interface

```typescript
export interface Kpi {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  date: string;  // ISO Date string
}
```

**Standard KPIs:**
| Title | Example Value | Unit |
|-------|---------------|------|
| Total tugas | 45 | tasks |
| Tugas terlewat | 2 | tasks |
| Tugas terselesaikan | 38 | tasks |
| Total Progress | 75% | percentage |

**Data Generation:** Mock data with 90-day history in `constants/index.ts`

---

## Goals

### Goal Interface

```typescript
export interface Goal {
  id: string;
  title: string;
  target: number;
  progress: number;
  unit: string;
  date: string;  // ISO Date string
}
```

**Standard Goals:**
| Title | Target | Unit |
|-------|--------|------|
| Target Sedekah Bulanan | 5,000,000 | Rp |
| Jumlah Transaksi Halal | 1,000 | transactions |
| Kepatuhan Akad | 100 | % |
| Penerima Manfaat Wakaf | 50 | people |

---

## Task Management

### ResetCycle Type

```typescript
export type ResetCycle = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
```

### Subtask Interface

```typescript
export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}
```

### HistoryEntry Interface

```typescript
export interface HistoryEntry {
  id: string;
  timestamp: string;  // ISO Date string
  value: number;
  note?: string;
}
```

### Task Interface

```typescript
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
  lastResetAt?: string;  // ISO String
  
  // History tracking
  history: HistoryEntry[];
}
```

**Task Features:**
- Basic todo (text + completed)
- Subtasks checklist
- Numeric targets with units
- Progress tracking
- Recurring tasks
- Increment-based tracking
- Dependency chains
- History log

---

## AI Chat

### Message Interface

```typescript
export interface Message {
  role: 'user' | 'model';
  content: string;
}
```

**Storage:** In-memory React state (not persisted)

---

## User Profile

### UserProfile Interface

```typescript
export interface UserProfile {
  name: string;
  zakatRate: number;
  preferredAkad: string;
  calculationMethod: 'Hijri' | 'Masehi';
  profilePicture?: string;
}
```

---

## Data Relationships

```
User
├── UserProfile (settings)
├── Role (admin/user)
└── Tasks
    └── Subtasks
    └── History

Directory (Knowledge Base)
├── Parent Items
│   └── Children (recursive)
└── Linked to Tools

Tools
├── Category
├── Icon
└── Related Directory Items

Dashboard
├── KPIs (time-series data)
└── Goals (time-series data)
```

---

## Data Persistence

### localStorage Keys

| Key | Data Type | Purpose |
|-----|-----------|---------|
| `syariahos_role` | `string` | User role (admin/user) |
| `syariahos_directory_v2` | `DirectoryItem[]` | Knowledge base |
| `theme` | `'light' \| 'dark'` | Theme preference |

### In-Memory State

| Data | Storage |
|------|---------|
| KPI data | Generated from mock data |
| Goals data | Generated from mock data |
| Tasks | Component state (not yet persisted) |
| Chat messages | Component state |
| View state | Component state |

---

## Mock Data Generation

Located in: `src/constants/index.ts`

### Generators

```typescript
// Generate 90 days of mock data
const generateMockData = <T extends { date: string }>(
  days: number, 
  factory: (date: Date, index: number) => Omit<T, 'date'>[]
): T[] => { ... }

// KPI factory
const kpiFactory = (date: Date, index: number): Omit<Kpi, 'date'>[] => { ... }

// Goal factory
const goalFactory = (date: Date, index: number): Omit<Goal, 'date'>[] => { ... }
```

### Date Range Queries

```typescript
// Get KPIs for specific time period
export const getKpiDataForPeriod = (days: number | null): Kpi[] => { ... }

// Get Goals for specific time period
export const getGoalsDataForPeriod = (days: number | null): Goal[] => { ... }
```

---

## Future Data Model Considerations

### Potential Additions

1. **User Authentication**
   ```typescript
   interface AuthToken {
     accessToken: string;
     refreshToken: string;
     expiresAt: string;
   }
   ```

2. **API Response Types**
   ```typescript
   interface ApiResponse<T> {
     data: T;
     status: number;
     message?: string;
   }
   ```

3. **Notification Type**
   ```typescript
   interface Notification {
     id: string;
     title: string;
     message: string;
     type: 'info' | 'warning' | 'error' | 'success';
     read: boolean;
     createdAt: string;
   }
   ```

4. **Activity Log**
   ```typescript
   interface Activity {
     id: string;
     userId: string;
     action: string;
     entityType: string;
     entityId: string;
     metadata: Record<string, unknown>;
     timestamp: string;
   }
   ```

---

*Generated by BMad Master - Document Project Workflow*
*Date: 2026-02-11*
