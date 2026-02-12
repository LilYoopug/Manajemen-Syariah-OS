# Project Overview: Manajemen Syariah OS (MSYV2)

## Executive Summary

**Manajemen Syariah OS** is a comprehensive web-based platform designed for Islamic (Syariah-compliant) management. It provides tools for personal/family management, Islamic business operations, community/institution management, financial planning, education, and social welfare tracking.

The application serves as a centralized dashboard for managing "amanah" (trusts/responsibilities) with AI-powered assistance and data-driven insights.

---

## Project Metadata

| Attribute | Value |
|-----------|-------|
| **Project Name** | Manajemen Syariah OS v2 |
| **Repository Type** | Monorepo |
| **Primary Language** | TypeScript |
| **Framework** | React 19.1.1 |
| **Build Tool** | Vite 6.4.1 |
| **Styling** | Tailwind CSS |
| **UI Library** | Lucide React (icons) |
| **Charts** | Recharts 3.7.0 |
| **AI Integration** | Google GenAI (Gemini) |
| **Total Files** | 333 |

---

## Repository Structure

```
MSYV2/
├── frontend/                 # React Web Application
│   ├── src/
│   │   ├── components/      # Feature-based components
│   │   │   ├── admin/       # Admin management
│   │   │   ├── ai/          # AI assistant & generator
│   │   │   ├── auth/        # Authentication
│   │   │   ├── common/      # Shared UI components
│   │   │   ├── dashboard/   # Dashboard features
│   │   │   ├── layout/      # Layout shell components
│   │   │   └── pages/       # Page-level components
│   │   ├── constants/       # Static data & mock data
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── types/           # TypeScript definitions
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── _bmad/                    # BMAD Framework
│   ├── core/                # Core workflows & agents
│   ├── bmm/                 # BMM module (workflows)
│   └── _config/             # Configuration files
├── docs/                     # Project documentation
└── .opencode/               # IDE integration
```

---

## Core Features

### 1. Dashboard & Analytics
- KPI tracking with historical data
- Goal progress visualization (Recharts)
- Date range filtering (7/30/all days)
- PDF/Excel export functionality
- AI-powered insights

### 2. Directory Wawasan (Knowledge Base)
- Hierarchical knowledge structure
- Quranic verses (Dalil) with sources
- Hadith references
- Maqasid Syariah principles
- POAC Islamic management principles
- Full CRUD operations in edit mode
- Search functionality

### 3. Tools Catalog
- 25+ categorized tools:
  - Individual/Family (4 tools)
  - Islamic Business (5 tools)
  - Institution/Community (4 tools)
  - Finance/Investment (4 tools)
  - Education (4 tools)
  - Social/Ummah (4 tools)

### 4. Task Management
- Task creation with subtasks
- Progress tracking (numeric targets)
- Recurring tasks (daily/weekly/monthly/yearly)
- Increment-based tracking
- History tracking

### 5. AI Assistant
- Google Gemini integration
- Context-aware responses (uses dashboard data)
- Syariah management expertise
- Quranic and Hadith references

### 6. Admin Panel
- User management
- Tool management
- Admin dashboard view

### 7. Theme Support
- Light/Dark mode toggle
- Persistent theme preference

---

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend Framework** | React 19.1.1 | UI library |
| **Language** | TypeScript 5.8.2 | Type safety |
| **Build Tool** | Vite 6.4.1 | Development & production builds |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Icons** | Lucide React 0.563.0 | Icon library |
| **Charts** | Recharts 3.7.0 | Data visualization |
| **AI** | @google/genai 1.20.0 | Gemini API integration |
| **Utilities** | clsx, tailwind-merge | Class name management |
| **State** | React Hooks + LocalStorage | State persistence |

---

## Architecture Pattern

**Component-Based Architecture with Feature-First Organization:**

- Each feature has its own folder with components
- Shared components in `common/`
- Layout components in `layout/`
- Type definitions centralized in `types/`
- Utility functions in `lib/`
- Custom hooks in `hooks/`

---

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main application component, routing logic |
| `src/components/index.ts` | Component exports barrel file |
| `src/types/index.ts` | TypeScript type definitions |
| `src/constants/index.ts` | Static data, mock data, utility functions |
| `vite.config.ts` | Vite configuration with path aliases |
| `package.json` | Dependencies and scripts |

---

## Getting Started

### Prerequisites
- Node.js (latest LTS recommended)
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Development

```bash
npm run dev
```
Server runs at `http://127.0.0.1:3000`

### Build

```bash
npm run build
```

---

## Authentication

- Simple localStorage-based auth
- Role-based access (admin/user)
- Dev shortcuts available for testing

**Admin Credentials:**
- Email: `admin@syariahos.com`
- Password: `admin123`

---

## Generated Documentation

- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Component Inventory](./component-inventory.md)
- [Development Guide](./development-guide.md)
- [API Contracts](./api-contracts.md) _(To be generated)_
- [Data Models](./data-models.md)

---

## Existing Documentation

- [Icon Usage Guide](./icon-usage.md) - Lucide React patterns
- [Loading States Guide](./loading-states.md) - Skeleton components
- [API Loading Guide](./api-loading-guide.md) - API-ready loading patterns

---

*Generated by BMad Master - Document Project Workflow*
*Date: 2026-02-11*
