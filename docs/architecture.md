# Architecture: Manajemen Syariah OS Frontend

## Executive Summary

The Manajemen Syariah OS frontend is a **Single Page Application (SPA)** built with React 19 and TypeScript. It follows a **Component-Based Architecture** with **Feature-First Organization** principles.

---

## Architecture Pattern

### Component-Based Architecture

The application is structured around reusable React components organized by feature domain:

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                             │
│                    (Root Component)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────────────────────────┐  │
│  │   Sidebar    │  │           Main Content Area         │  │
│  │  (Layout)    │  │  ┌─────────────────────────────┐    │  │
│  │              │  │  │         Header              │    │  │
│  │ - Navigation │  │  └─────────────────────────────┘    │  │
│  │ - Directory  │  │  ┌─────────────────────────────┐    │  │
│  │ - User Menu  │  │  │                             │    │  │
│  └──────────────┘  │  │      View Components        │    │  │
│                    │  │                             │    │  │
│                    │  │  - Dashboard                │    │  │
│                    │  │  - ToolsCatalog             │    │  │
│                    │  │  - TaskManager              │    │  │
│                    │  │  - AIGenerator              │    │  │
│                    │  │  - ...                      │    │  │
│                    │  │                             │    │  │
│                    │  └─────────────────────────────┘    │  │
│                    └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### State Management Pattern

**Local State with Contextual Persistence:**

| State Type | Implementation | Persistence |
|------------|----------------|-------------|
| **UI State** | React useState | In-memory |
| **User Preferences** | localStorage | Browser storage |
| **Directory Data** | useLocalStorage hook | localStorage |
| **Auth State** | localStorage | localStorage (role) |
| **Theme** | localStorage + CSS classes | localStorage |

---

## Technology Stack Details

### Frontend Layer

| Technology | Version | Role |
|------------|---------|------|
| React | 19.1.1 | UI component library |
| React DOM | 19.1.1 | DOM rendering |
| TypeScript | 5.8.2 | Type safety |

### Build & Development

| Technology | Version | Role |
|------------|---------|------|
| Vite | 6.4.1 | Build tool, dev server |
| @vitejs/plugin-react | 5.0.0 | React HMR |

### Styling

| Technology | Version | Role |
|------------|---------|------|
| Tailwind CSS | 3.4.0 (implied) | Utility-first CSS |
| tailwind-merge | 3.4.0 | Class name merging |
| clsx | 2.1.1 | Conditional classes |

### Data Visualization

| Technology | Version | Role |
|------------|---------|------|
| Recharts | 3.7.0 | Charts & graphs |

### AI Integration

| Technology | Version | Role |
|------------|---------|------|
| @google/genai | 1.20.0 | Gemini API client |

### Icons

| Technology | Version | Role |
|------------|---------|------|
| lucide-react | 0.563.0 | Icon library |

---

## Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── admin/              # Admin management components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminToolManager.tsx
│   │   │   └── AdminUserManager.tsx
│   │   ├── ai/                 # AI-related components
│   │   │   ├── AIAssistant.tsx       # Chat assistant sidebar
│   │   │   ├── AIGenerator.tsx       # AI content generator
│   │   │   └── AIInsightCard.tsx     # AI-powered dashboard insights
│   │   ├── auth/               # Authentication components
│   │   │   └── Auth.tsx
│   │   ├── common/             # Shared UI components
│   │   │   ├── Icons.tsx       # Icon exports (Lucide wrapper)
│   │   │   ├── KpiCard.tsx     # KPI display card
│   │   │   └── Skeleton.tsx    # Loading skeleton variants
│   │   ├── dashboard/          # Dashboard feature components
│   │   │   ├── Dashboard.tsx         # Main dashboard view
│   │   │   ├── Directory.tsx         # Directory sidebar content
│   │   │   ├── DirectoryDetailModal.tsx
│   │   │   ├── GoalTracker.tsx
│   │   │   ├── TaskManager.tsx
│   │   │   ├── ToolDetailModal.tsx
│   │   │   └── ToolsCatalog.tsx
│   │   ├── layout/             # Layout shell components
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── pages/              # Page-level components
│   │   │   ├── LandingPage.tsx
│   │   │   └── Settings.tsx
│   │   └── index.ts            # Barrel exports
│   ├── constants/
│   │   └── index.ts            # Static data, mock generators
│   ├── hooks/
│   │   └── useLocalStorage.ts  # localStorage persistence hook
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn helper)
│   ├── types/
│   │   └── index.ts            # TypeScript definitions
│   ├── App.tsx                 # Root application component
│   └── index.tsx               # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Component Hierarchy

```
App
├── LandingPage (entry view)
├── Auth (login/register)
└── MainLayout (authenticated)
    ├── Sidebar
    │   ├── Navigation Items
    │   ├── Directory Tree
    │   └── User Menu
    ├── Header
    │   ├── Mobile Menu Toggle
    │   ├── AI Assistant Toggle
    │   ├── Theme Toggle
    │   └── User Avatar
    └── Main Content
        ├── Dashboard
        │   ├── KPI Cards
        │   ├── AI Insight Card
        │   ├── Chart (Recharts)
        │   └── Goal Tracker
        ├── ToolsCatalog
        ├── TaskManager
        ├── AIGenerator
        ├── Settings
        └── Admin Views
```

---

## Data Flow

### 1. Dashboard Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Date      │────▶│   App.tsx    │────▶│  Dashboard  │
│   Range     │     │  (useState)  │     │   Props     │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                                                ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Display   │◀────│    KPI/Goal  │◀────│  Constants  │
│   Cards     │     │   Process    │     │   (mock)    │
└─────────────┘     └──────────────┘     └─────────────┘
```

### 2. Directory Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   localStorage│◀──▶│ useLocalStorage│◀──▶│  Sidebar    │
│   (persist) │     │    Hook      │     │   State     │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                                                ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Modal     │◀────│   Edit/Add   │◀────│   User      │
│   (Detail)  │     │   Operations │     │   Actions   │
└─────────────┘     └──────────────┘     └─────────────┘
```

### 3. AI Assistant Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    User     │────▶│   App.tsx    │────▶│ AIAssistant │
│   Clicks    │     │  (setState)  │     │   Opens     │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                                                ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Stream    │◀────│  GoogleGenAI │◀────│   User      │
│   Response  │     │  (Gemini)    │     │   Prompt    │
└─────────────┘     └──────────────┘     └─────────────┘
```

---

## Key Architectural Decisions

### 1. Feature-First Organization
- Components grouped by feature domain (admin/, ai/, dashboard/)
- Easier maintenance and scalability
- Clear separation of concerns

### 2. Path Aliases
```typescript
// vite.config.ts
alias: {
  '@/types': './src/types/index.ts',
  '@/constants': './src/constants/index.ts',
  '@/hooks': './src/hooks',
  '@/components/common': './src/components/common',
  '@': './src',
}
```
- Cleaner imports
- Refactoring-friendly

### 3. TypeScript Strict Mode
- Full type safety
- Interface-driven development
- Centralized types in `types/index.ts`

### 4. Tailwind for Styling
- Utility-first approach
- Dark mode support via `dark:` prefixes
- Consistent design system

### 5. Local State Management
- No Redux/Zustand needed for current scale
- React hooks sufficient
- localStorage for persistence

---

## State Management Architecture

### Authentication State
```typescript
// Stored in localStorage
const role = localStorage.getItem('syariahos_role'); // 'admin' | 'user'
```

### Theme State
```typescript
// Stored in localStorage + CSS class
const theme = localStorage.getItem('theme'); // 'light' | 'dark'
document.documentElement.classList.toggle('dark', theme === 'dark');
```

### Directory State
```typescript
// Custom hook with localStorage
const [directoryData, setDirectoryData] = useLocalStorage(
  'syariahos_directory_v2', 
  INITIAL_DIRECTORY
);
```

---

## External Dependencies

### AI Service
- **Google Gemini API** via `@google/genai`
- Model: `gemini-3-flash-preview`
- System instructions for Syariah expertise

### Charting
- **Recharts** for data visualization
- Responsive container
- Custom tooltip styling

### Icons
- **Lucide React** - 40+ icons aliased for familiarity

---

## Performance Considerations

1. **Lazy Loading**: Not currently implemented (single bundle)
2. **Memoization**: `useMemo` for KPI/Goal calculations
3. **Virtualization**: Not needed for current data scale
4. **Code Splitting**: Potential for future optimization

---

## Security Notes

1. **API Key**: Stored in `.env.local`, injected at build time
2. **Auth**: Simple client-side storage (development-focused)
3. **XSS**: React's built-in escaping
4. **CSP**: Not currently configured

---

## Future Architecture Considerations

1. **State Management**: Zustand or Redux Toolkit for larger scale
2. **API Layer**: React Query for server state
3. **Testing**: Jest + React Testing Library
4. **CI/CD**: GitHub Actions for automated builds

---

*Generated by BMad Master - Document Project Workflow*
*Date: 2026-02-11*
