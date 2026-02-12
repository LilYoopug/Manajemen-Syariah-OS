---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain-skipped', 'step-06-innovation-skipped', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - docs/index.md
  - docs/project-overview.md
  - docs/architecture.md
  - docs/source-tree-analysis.md
  - docs/component-inventory.md
  - docs/data-models.md
  - docs/development-guide.md
  - docs/icon-usage.md
  - docs/loading-states.md
  - docs/api-loading-guide.md
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 10
workflowType: 'prd'
classification:
  projectType: api_backend
  domain: general
  complexity: medium
  projectContext: brownfield
  techStack:
    framework: Laravel
    database: SQLite
    auth: Laravel Sanctum (Bearer Token only)
    language: PHP
---

# Product Requirements Document - MSYV2

**Author:** Tubagus
**Date:** 2026-02-11

## Executive Summary

MSYV2 (Manajemen Syariah OS) is an Islamic management platform with a fully-built React 19 frontend that currently stores all data in localStorage and hardcoded constants. This PRD defines the requirements for a **Laravel REST API backend** that replaces all client-side data storage with persistent, secure, server-side APIs.

**Core architecture decision:** Tasks (Tugas Amanah) are the single source of truth. All dashboard KPIs, Goals, charts, and progress bars are computed from task data — no separate KPI or Goal tables.

**Tech stack:** Laravel + SQLite + Sanctum Bearer Token (only). New `backend/` folder alongside existing `frontend/`.

**Scope:** 47 functional requirements across 8 capability areas, covering 100% of the frontend's data needs (all 23 React components analyzed).

## Success Criteria

### User Success

- All data currently in `localStorage` and hardcoded constants served by Laravel API endpoints
- Users can register, login, and access their own persisted data across sessions/devices
- Admin users can manage tools and users through real backend CRUD
- AI features (chat, generator, insight) proxied through the backend securely
- Zero UI regressions — frontend works identically, just backed by real APIs

### Business Success

- Complete backend coverage: every frontend component that reads/writes data has a corresponding API
- Single deployable backend folder alongside the existing frontend

### Technical Success

- Laravel + SQLite + Sanctum Bearer Token auth — no other auth mechanism
- RESTful API design matching the frontend's existing data structures
- Clean separation: new `backend/` folder, frontend untouched until API integration phase
- Tasks as single source of truth: all dashboard metrics computed/aggregated from task data

### Measurable Outcomes

- 100% of localStorage keys replaced by API calls (`syariah_os_tasks`, `syariah_os_categories`, `syariah_os_profile`, `syariahos_role`)
- 100% of hardcoded constants migrated to seeded database (`DIRECTORY_DATA`, `TOOLS_DATA`)
- All 23 frontend components' data needs covered by API endpoints
- Dashboard data (KPIs, Goals, charts, progress bars) fully derived from tasks table aggregations

## Product Scope

### MVP Strategy

**Approach:** Problem-solving MVP — replace all client-side data storage with a real backend so data persists, is secure, and works across devices.

**Resource Requirements:** Solo developer, Laravel + SQLite stack, single `backend/` folder.

**Core User Journeys Supported:** All 4 journeys (regular user task management, error recovery, admin platform management, knowledge browsing)

### MVP Feature Set (Phase 1)

| Priority | Capability | Without it? |
|----------|-----------|-------------|
| P0 | Auth (register/login/logout + Sanctum token) | No users, product fails |
| P0 | Tasks CRUD + toggle + history | Core entity, everything depends on it |
| P0 | Dashboard (computed from tasks) | Primary value screen, product feels empty |
| P0 | Categories | Tasks depend on categories for filtering |
| P0 | Profile/Settings CRUD | Users can't personalize |
| P1 | Directory (seeded + CRUD) | Knowledge hub is a core pillar |
| P1 | Tools catalog (seeded, read-only) | Productivity pillar, read-only = low effort |
| P1 | Admin user/tool management | Admin can't operate without it |
| P1 | Admin stats/logs | Admin dashboard is empty without it |
| P2 | AI proxy (chat, generator, insight) | Works without it — can keep client-side temporarily |
| P2 | Profile export/reset | Nice-to-have for MVP |

### Phase 2 — Growth (Post-MVP)

- SQLite → MySQL/PostgreSQL migration
- File upload for profile pictures
- API rate limiting
- Task import/export
- Enhanced admin analytics

### Phase 3 — Expansion (Future)

- Multi-tenant support
- OAuth/social login options
- Webhook integrations
- Real-time notifications (WebSocket)
- Mobile API optimizations

### Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| SQLite concurrency limits | Low | Design with Eloquent so DB swap is config-only |
| Frontend integration breakage | Medium | Match TypeScript interfaces exactly in API responses |
| AI proxy rate limits | Low | Queue AI requests, retry logic, graceful degradation |
| Task reset cycle bugs | Medium | Unit test reset logic thoroughly, use Laravel scheduler |
| CORS issues | Low | Configure in `cors.php` from day one, test with Vite dev server |

## User Journeys

### Journey 1: Rina — Regular User, Daily Task Management

**Who:** Rina, a small business owner using SyariahOS to track her Islamic business compliance tasks.

**Opening:** Rina registers on SyariahOS, sets up her profile with her name and Shariah preferences (zakat rate, preferred akad, calendar method). She logs in and gets a Bearer token.

**Rising Action:** She creates tasks (Tugas Amanah) across categories — SDM, Keuangan, Kepatuhan — with numeric targets and reset cycles. Each day she toggles tasks, incrementing progress. She checks the Dashboard to see her KPIs and goal progress computed from her task data. Charts show her weekly trends.

**Climax:** End of month — her Dashboard shows 87% Kepatuhan Syariah score, computed from her completed tasks. She uses the AI Generator to create next month's strategic plan based on her current performance.

**Resolution:** Her data persists across devices. She exports a backup from Settings. Her tasks auto-reset based on their cycles (daily/weekly/monthly).

**Reveals:** Auth flow, task CRUD + toggle + history, dashboard aggregation endpoints, AI proxy, profile/settings CRUD, data export

### Journey 2: Rina — Edge Case, Error Recovery

**Opening:** Rina accidentally deletes a task with months of history. She mistypes her target value on a task.

**Rising Action:** She edits a history entry to correct a wrong increment. She updates a task's target value mid-cycle.

**Resolution:** All mutations are atomic — partial updates don't corrupt computed dashboard data. Validation prevents zero/negative targets.

**Reveals:** Input validation, history CRUD (edit/delete entries), task update edge cases, data integrity on aggregation

### Journey 3: Ahmad — Admin User, Platform Management

**Who:** Ahmad, the system administrator overseeing all SyariahOS users.

**Opening:** Ahmad logs in with admin role. He sees the Admin Dashboard with platform-wide stats (total users, total tasks, activity logs).

**Rising Action:** He manages users — creates new accounts, edits roles, deactivates users. He manages the Tools Catalog — adds new tools, updates descriptions and links, removes deprecated ones. He monitors system activity through logs.

**Climax:** A new batch of tools needs to be added for Ramadhan. Ahmad bulk-manages the catalog while monitoring user activity.

**Resolution:** All admin actions are role-gated. Regular users cannot access admin endpoints. Admin sees computed platform-wide stats.

**Reveals:** Role-based middleware, admin user CRUD, admin tool CRUD, admin stats/logs endpoints, authorization guards

### Journey 4: Rina — Browsing Knowledge & Tools

**Opening:** Rina browses the Directory (Islamic knowledge tree) to find guidance on Murabahah contracts. She navigates the tree structure, expanding nodes.

**Rising Action:** She discovers a related tool in the Tools Catalog — the Syariah Installment Calculator. She opens it, sees its inputs/outputs, Shariah basis, and related dalil. She clicks the external link to use it.

**Climax:** She uses the AI Assistant to ask a specific muamalah question, getting an instant response proxied through the backend (keeping her API key secure).

**Resolution:** All content is seeded from the existing constants, browsable and filterable by category.

**Reveals:** Directory tree GET endpoint, tools catalog with category filter, AI chat proxy endpoint, seeded data integrity

### Journey Requirements Summary

| Capability | Journeys |
|-----------|----------|
| Auth (register/login/logout + Bearer token) | 1, 3 |
| Task CRUD + toggle + history management | 1, 2 |
| Dashboard computed aggregations (KPIs, goals, charts) | 1 |
| Profile/Settings CRUD + data export | 1 |
| Admin role-gated user management | 3 |
| Admin role-gated tool management | 3 |
| Admin stats/logs (computed) | 3 |
| Directory tree (read, seeded) | 4 |
| Tools catalog (read, seeded, filterable) | 4 |
| AI proxy (chat, generate, insight) | 1, 4 |
| Input validation + data integrity | 2 |
| Authorization middleware (user vs admin) | 3 |

## API Backend Specifications

### Overview

REST API backend built with Laravel, serving the existing React 19 frontend. Single consumer, no third-party API access planned. All endpoints return JSON. Authentication via Laravel Sanctum Bearer tokens exclusively.

### Authentication Model

| Aspect | Decision |
|--------|----------|
| Method | Laravel Sanctum — Bearer Token |
| Token delivery | `POST /api/auth/login` returns token in response body |
| Token usage | `Authorization: Bearer {token}` header on all protected routes |
| Session/Cookie | **Disabled** — stateless token-only |
| Roles | `user`, `admin` (stored on users table) |
| Middleware | `auth:sanctum` + custom `admin` middleware for admin routes |

### Endpoint Specifications

```
AUTH (public)
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout              [auth]

TASKS (auth)
  GET    /api/tasks                     ?category=&search=&cycle=
  POST   /api/tasks
  PUT    /api/tasks/{id}
  DELETE /api/tasks/{id}
  PATCH  /api/tasks/{id}/toggle
  PUT    /api/tasks/{id}/history/{entryId}
  DELETE /api/tasks/{id}/history/{entryId}

CATEGORIES (auth)
  GET    /api/categories

DASHBOARD (auth)
  GET    /api/dashboard                 → computed KPIs, goals, chart data from tasks

DIRECTORY (auth)
  GET    /api/directory                 → tree structure
  POST   /api/directory
  PUT    /api/directory/{id}
  DELETE /api/directory/{id}

TOOLS (auth)
  GET    /api/tools                     ?category=
  GET    /api/tools/{id}

AI PROXY (auth)
  POST   /api/ai/chat
  POST   /api/ai/generate-plan
  POST   /api/ai/insight

PROFILE (auth)
  GET    /api/profile
  PUT    /api/profile
  POST   /api/profile/export
  POST   /api/profile/reset

ADMIN (auth + admin middleware)
  GET    /api/admin/stats
  GET    /api/admin/logs
  GET    /api/admin/users               ?search=&page=
  POST   /api/admin/users
  PUT    /api/admin/users/{id}
  DELETE /api/admin/users/{id}
  GET    /api/admin/users/export
  GET    /api/admin/tools
  POST   /api/admin/tools
  PUT    /api/admin/tools/{id}
  DELETE /api/admin/tools/{id}
```

### Data Schemas

Mapped 1:1 from existing TypeScript interfaces in `frontend/src/types/index.ts`:

| Model | Key Fields |
|-------|-----------|
| `User` | id, name, email, password, role (default: 'user'), theme (default: 'light'), profile_picture, zakat_rate, preferred_akad, calculation_method |
| `Task` | id, user_id, text, completed, category, progress, has_limit, current_value, target_value, unit, reset_cycle, per_check_enabled, increment_value, last_reset_at |
| `TaskHistory` | id, task_id, value, note, timestamp |
| `Category` | id, user_id, name |
| `DirectoryItem` | id, parent_id, title, type, content, children (self-referential) |
| `Tool` | id, name, category, description, inputs, outputs, benefits, sharia_basis, link, related_directory_ids, related_dalil_text, related_dalil_source |
| `ActivityLog` | id, user_id, action, subject_type, subject_id, metadata (JSON), created_at |

### Error Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 401 | Unauthenticated (invalid/missing token) |
| 403 | Forbidden (user accessing admin routes) |
| 404 | Resource not found |
| 422 | Validation error (with field-level errors) |
| 500 | Server error |

### Implementation Considerations

- **CORS:** Configure for frontend origin (Vite dev server + production domain)
- **Database seeding:** Migrate `TOOLS_DATA` (25+ tools) and `DIRECTORY_DATA` (tree) from `frontend/src/constants/index.ts` into Laravel seeders
- **Task reset cycles:** Backend cron job or middleware to auto-reset tasks based on `reset_cycle` (daily/weekly/monthly/yearly)
- **AI Proxy:** Server-side Gemini API key in `.env`, never exposed to frontend
- **Dashboard computation:** Aggregate queries on tasks table — no materialized views needed at SQLite scale
- **Profile & Settings:** Single `PUT /api/profile` endpoint handles all user preferences (name, profile picture, theme, shariah settings) — no separate settings endpoint

## Functional Requirements

### Identity & Access

- FR1: Visitors can register a new account with name, email, and password
- FR2: Users can authenticate with email and password to receive a bearer token
- FR3: Users can terminate their session (invalidate token)
- FR4: System assigns a default role of 'user' to new accounts; admins can promote accounts to 'admin' role
- FR5: System restricts admin-only capabilities to accounts with admin role

### Task Management

- FR6: Users can create tasks with description, category, and reset cycle
- FR7: Users can configure tasks with numeric targets (target value, unit, increment value)
- FR8: Users can view their tasks with filtering by category and text search
- FR9: Users can toggle task completion (binary or incremental progress)
- FR10: Users can update task details after creation
- FR11: Users can delete tasks
- FR12: System records a history entry each time task progress changes
- FR13: Users can view the history log of a task
- FR14: Users can edit individual history entries
- FR15: Users can delete individual history entries
- FR16: System recalculates task progress when history entries are modified
- FR17: System auto-resets recurring tasks based on their cycle (daily/weekly/monthly/yearly)
- FR18: Users can manage task categories (view default set)

### Performance Monitoring

- FR19: Users can view a dashboard of KPI metrics computed from their task data
- FR20: Users can view goal progress computed from their task categories and targets
- FR21: Users can view chart data showing task completion trends over time
- FR22: Dashboard data updates reflect current task state without manual refresh

### Knowledge Directory

- FR23: Users can browse the Islamic knowledge directory as a navigable tree
- FR24: Users can view detail content of any directory item
- FR25: Users can create new directory items within the tree
- FR26: Users can update existing directory items
- FR27: Users can delete directory items
- FR28: System provides pre-seeded directory content on initial setup

### Tools Catalog

- FR29: Users can browse all available tools
- FR30: Users can filter tools by category
- FR31: Users can view detailed information about a tool (description, inputs, outputs, benefits, shariah basis, related dalil)
- FR32: System provides pre-seeded tools catalog on initial setup

### AI Assistance

- FR33: Users can have a conversational chat with an AI assistant on muamalah topics
- FR34: Users can generate strategic plans using AI based on their goals
- FR35: Users can receive AI-generated insights based on their KPI and goal data
- FR36: System proxies all AI requests server-side (API keys never exposed to client)

### User Preferences

- FR37: Users can view and update their profile (name, profile picture URL)
- FR38: Users can configure shariah preferences (zakat rate, preferred akad, calendar method)
- FR39: Users can export all their data as a downloadable file
- FR40: Users can reset all their data
- FR41: Users can set visual theme preference (light/dark)

### Platform Administration

- FR42: Admins can view platform-wide statistics (total users, total tasks, activity summary)
- FR43: Admins can view system activity logs (login, task CRUD, user management actions recorded with actor, action, subject, and timestamp)
- FR44: Admins can list, create, update, and delete user accounts
- FR45: Admins can manage user roles
- FR46: Admins can export user data
- FR47: Admins can list, create, update, and delete tools in the catalog

## Non-Functional Requirements

### Performance

- NFR1: API endpoints return responses within 500ms under normal load
- NFR2: Dashboard aggregation endpoint returns within 1 second for up to 1,000 tasks per user
- NFR3: Authentication endpoints respond within 300ms
- NFR4: AI proxy endpoints may take up to 30s due to external Gemini API — frontend handles loading states

### Security

- NFR5: All API communication over HTTPS
- NFR6: Passwords hashed using bcrypt (Laravel default)
- NFR7: Bearer tokens are the sole authentication mechanism — no session cookies
- NFR8: Gemini API key stored server-side in `.env`, never included in API responses
- NFR9: Users can only access their own data — enforced at query level
- NFR10: Admin routes protected by role-checking middleware
- NFR11: Input validation on all endpoints to prevent injection and malformed data
- NFR12: CORS restricted to allowed frontend origins only

### Integration

- NFR13: Backend exposes JSON REST API consumable by the React 19 frontend
- NFR14: CORS configured for Vite dev server (localhost:5173) and production domain
- NFR15: Gemini API integration uses server-side HTTP client with timeout and error handling
- NFR16: API response shapes match existing TypeScript interfaces in `frontend/src/types/index.ts`
