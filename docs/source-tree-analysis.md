# Source Tree Analysis: Manajemen Syariah OS

## Complete Directory Structure

```
MSYV2/
├── _bmad/                                    # BMAD Framework (Infrastructure)
│   ├── _config/                             # Configuration files
│   │   ├── agents/                          # Agent customizations
│   │   ├── ides/                            # IDE configurations
│   │   ├── agent-manifest.csv
│   │   ├── bmad-help.csv
│   │   ├── files-manifest.csv
│   │   ├── manifest.yaml
│   │   ├── task-manifest.csv
│   │   ├── tool-manifest.csv
│   │   └── workflow-manifest.csv
│   ├── _memory/                             # Runtime memory
│   │   └── tech-writer-sidecar/
│   ├── bmm/                                 # BMM Module
│   │   ├── agents/                          # BMM agent definitions
│   │   ├── config.yaml
│   │   ├── data/
│   │   ├── module-help.csv
│   │   ├── teams/
│   │   └── workflows/                       # 40+ workflow definitions
│   │       ├── 1-analysis/
│   │       ├── 2-plan-workflows/
│   │       ├── 3-solutioning/
│   │       ├── 4-implementation/
│   │       ├── bmad-quick-flow/
│   │       ├── document-project/
│   │       ├── generate-project-context/
│   │       └── qa/
│   └── core/                                # Core BMAD
│       ├── agents/
│       ├── config.yaml
│       ├── module-help.csv
│       ├── tasks/
│       └── workflows/
│
├── docs/                                     # Project Documentation (This Folder)
│   ├── plans/                               # Implementation plans
│   │   ├── 2025-02-10-api-ready-skeleton-loading.md
│   │   ├── 2025-02-10-frontend-folder-reorganization.md
│   │   ├── 2025-02-10-lucide-icons-migration.md
│   │   └── 2025-02-10-skeleton-loading-states.md
│   ├── verification/                        # Test logs
│   │   └── icon-migration-test-log.md
│   ├── api-loading-guide.md
│   ├── icon-usage.md
│   ├── loading-states.md
│   ├── project-overview.md
│   ├── architecture.md
│   ├── source-tree-analysis.md
│   ├── component-inventory.md
│   ├── development-guide.md
│   ├── data-models.md
│   └── project-scan-report.json
│
├── frontend/                                 # MAIN APPLICATION
│   ├── src/
│   │   ├── components/                      # REACT COMPONENTS
│   │   │   ├── admin/                       # [FEATURE] Admin Management
│   │   │   │   ├── .gitkeep
│   │   │   │   ├── AdminDashboard.tsx      # Admin overview dashboard
│   │   │   │   ├── AdminToolManager.tsx    # Tool management CRUD
│   │   │   │   └── AdminUserManager.tsx    # User management CRUD
│   │   │   │
│   │   │   ├── ai/                          # [FEATURE] AI Integration
│   │   │   │   ├── .gitkeep
│   │   │   │   ├── AIAssistant.tsx         # AI Chat sidebar component
│   │   │   │   ├── AIGenerator.tsx         # AI content generation tool
│   │   │   │   └── AIInsightCard.tsx       # AI-powered dashboard insights
│   │   │   │
│   │   │   ├── auth/                        # [FEATURE] Authentication
│   │   │   │   ├── .gitkeep
│   │   │   │   └── Auth.tsx                # Login/register component
│   │   │   │
│   │   │   ├── common/                      # [SHARED] Common UI Components
│   │   │   │   ├── .gitkeep
│   │   │   │   ├── Icons.tsx               # Lucide icon re-exports
│   │   │   │   ├── KpiCard.tsx             # KPI display card
│   │   │   │   └── Skeleton.tsx            # Loading skeleton components
│   │   │   │
│   │   │   ├── dashboard/                   # [FEATURE] Dashboard
│   │   │   │   ├── .gitkeep
│   │   │   │   ├── Dashboard.tsx           # Main dashboard view
│   │   │   │   ├── Directory.tsx           # Directory sidebar tree
│   │   │   │   ├── DirectoryDetailModal.tsx # Directory item detail modal
│   │   │   │   ├── GoalTracker.tsx         # Goal progress component
│   │   │   │   ├── TaskManager.tsx         # Task management view
│   │   │   │   ├── ToolDetailModal.tsx     # Tool detail modal
│   │   │   │   └── ToolsCatalog.tsx        # Tools catalog view
│   │   │   │
│   │   │   ├── layout/                      # [LAYOUT] Layout Components
│   │   │   │   ├── .gitkeep
│   │   │   │   ├── Header.tsx              # Top header bar
│   │   │   │   └── Sidebar.tsx             # Left sidebar navigation
│   │   │   │
│   │   │   ├── pages/                       # [PAGES] Page Components
│   │   │   │   ├── .gitkeep
│   │   │   │   ├── LandingPage.tsx         # Landing/entry page
│   │   │   │   └── Settings.tsx            # User settings page
│   │   │   │
│   │   │   └── index.ts                     # Barrel exports
│   │   │
│   │   ├── constants/                       # [DATA] Static Data
│   │   │   ├── .gitkeep
│   │   │   └── index.ts                     # Mock data, constants, generators
│   │   │
│   │   ├── hooks/                           # [HOOKS] Custom React Hooks
│   │   │   ├── .gitkeep
│   │   │   └── useLocalStorage.ts          # localStorage persistence hook
│   │   │
│   │   ├── lib/                             # [UTILS] Utility Functions
│   │   │   └── utils.ts                     # cn() helper for Tailwind
│   │   │
│   │   ├── types/                           # [TYPES] TypeScript Definitions
│   │   │   ├── .gitkeep
│   │   │   └── index.ts                     # All type definitions
│   │   │
│   │   ├── App.tsx                          # [ENTRY] Root App Component
│   │   └── index.tsx                        # [ENTRY] Application Entry Point
│   │
│   ├── .env.local                           # Environment variables
│   ├── .gitignore
│   ├── index.html                           # HTML template
│   ├── metadata.json                        # App metadata
│   ├── package.json                         # Dependencies
│   ├── package-lock.json
│   ├── README.md                            # Setup instructions
│   ├── tsconfig.json                        # TypeScript config
│   └── vite.config.ts                       # Vite configuration
│
├── .opencode/                               # IDE Integration
│   ├── agent/                               # Agent definitions
│   ├── command/                             # Command definitions
│   ├── .gitignore
│   ├── bun.lock
│   └── package.json
│
├── .gitignore
└── copy-of-copy-of-manajemen-syariah-os-v2(1).zip  # Archive
```

---

## Critical Folders Explained

### `/frontend/src/components/` — Feature-Based Organization

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| `admin/` | Admin management interface | AdminDashboard, AdminUserManager, AdminToolManager |
| `ai/` | AI assistant and generation | AIAssistant, AIGenerator, AIInsightCard |
| `auth/` | Authentication flows | Auth (login/register) |
| `common/` | Shared UI primitives | Icons, KpiCard, Skeleton |
| `dashboard/` | Dashboard features | Dashboard, ToolsCatalog, TaskManager, Directory |
| `layout/` | Layout shell | Header, Sidebar |
| `pages/` | Top-level pages | LandingPage, Settings |

### `/frontend/src/types/` — TypeScript Definitions

Centralized type definitions for:
- View types (routing)
- User roles
- Directory items
- Tools
- KPIs and Goals
- Tasks
- Messages

### `/frontend/src/constants/` — Static Data

Contains:
- Raw directory data (Quranic verses, Hadith, Maqasid)
- Tools catalog data (25 tools)
- Mock data generators for KPIs and Goals
- Data transformation utilities

### `/frontend/src/hooks/` — Custom Hooks

| Hook | Purpose |
|------|---------|
| `useLocalStorage` | Persist state to localStorage with type safety |

### `/frontend/src/lib/` — Utilities

| File | Purpose |
|------|---------|
| `utils.ts` | `cn()` function for merging Tailwind classes |

---

## Entry Points

| File | Role |
|------|------|
| `frontend/index.html` | HTML entry point |
| `frontend/src/index.tsx` | JavaScript entry point |
| `frontend/src/App.tsx` | Root React component |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration, path aliases |
| `tsconfig.json` | TypeScript compiler configuration |
| `package.json` | NPM dependencies and scripts |
| `.env.local` | Environment variables (API keys) |

---

## File Count by Category

| Category | Count |
|----------|-------|
| React Components (.tsx) | 24 |
| Type Definitions (.ts) | 1 |
| Custom Hooks (.ts) | 1 |
| Utilities (.ts) | 1 |
| Constants (.ts) | 1 |
| Configuration Files | 5 |
| Documentation (.md) | 8 |
| **Total Source Files** | **~41** |

---

## Navigation Structure

```
Landing Page
    │
    ├── Login/Register (Auth)
    │       │
    │       └── Dashboard (User)
    │               ├── Dashboard View
    │               ├── Tasks View
    │               ├── Tools Catalog
    │               ├── AI Generator
    │               └── Settings
    │
    └── Admin Dashboard (Admin)
            ├── Admin Dashboard
            ├── User Management
            └── Tool Management
```

---

## Component Dependencies

```
App.tsx
├── Sidebar.tsx
│   └── Icons.tsx
├── Header.tsx
│   └── Icons.tsx
├── Dashboard.tsx
│   ├── KpiCard.tsx
│   ├── AIInsightCard.tsx
│   ├── GoalTracker.tsx
│   └── Recharts
├── ToolsCatalog.tsx
├── TaskManager.tsx
├── AIGenerator.tsx
├── AIAssistant.tsx
│   ├── Icons.tsx
│   └── GoogleGenAI
├── Auth.tsx
│   └── Icons.tsx
└── Settings.tsx
```

---

*Generated by BMad Master - Document Project Workflow*
*Date: 2026-02-11*
