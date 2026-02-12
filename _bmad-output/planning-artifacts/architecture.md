---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
status: 'complete'
completedAt: '2026-02-12'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - docs/index.md
  - docs/architecture.md
  - docs/data-models.md
  - docs/component-inventory.md
  - docs/source-tree-analysis.md
  - docs/project-overview.md
  - docs/development-guide.md
workflowType: 'architecture'
project_name: 'MSYV2'
user_name: 'Tubagus'
date: '2026-02-11'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:** 47 FRs across 8 capability areas:

| Area | FR Count | Architectural Impact |
|------|----------|---------------------|
| Identity & Access | 5 | Auth middleware, role system, token management |
| Task Management | 13 | Core CRUD, history tracking, auto-reset scheduler, highest complexity |
| Performance Monitoring | 4 | Computed aggregation queries on tasks, no storage needed |
| Knowledge Directory | 6 | Self-referential tree model, seeded data, recursive queries |
| Tools Catalog | 4 | Read-only seeded data, category filtering |
| AI Assistance | 4 | External API proxy, long timeouts, API key security |
| User Preferences | 5 | Profile CRUD, settings storage, data export/reset |
| Platform Administration | 6 | Admin-scoped queries across all users, role gating |

**Non-Functional Requirements:** 16 NFRs driving architecture:
- **Performance:** 500ms general, 1s dashboard, 300ms auth, 30s AI proxy
- **Security:** bcrypt, bearer-only, data ownership scoping, CORS, input validation
- **Integration:** JSON REST, CORS for Vite, Gemini HTTP client, response shape matching TypeScript interfaces

**Scale & Complexity:**
- Primary domain: API backend (single React frontend consumer)
- Complexity level: Medium
- Estimated architectural components: ~11 controllers, ~7 models, ~7 migrations, ~3 middleware, ~2 seeders, 1 scheduler

### Technical Constraints & Dependencies

- **Laravel + SQLite:** Eloquent ORM abstracts DB — SQLite for now, swappable to MySQL/PostgreSQL via config
- **Sanctum Bearer Token only:** No session driver, no cookie auth, stateless
- **Single frontend consumer:** No API versioning needed, CORS locked to known origins
- **Gemini API dependency:** External service, requires timeout handling and graceful degradation
- **Frontend interface contract:** API response shapes must match `frontend/src/types/index.ts` exactly

### Cross-Cutting Concerns

| Concern | Scope | Implementation Pattern |
|---------|-------|----------------------|
| Authentication | All protected routes (32 of 35) | `auth:sanctum` middleware |
| Authorization | Admin routes (11 endpoints) | Custom `admin` middleware |
| Data ownership | User-scoped data (tasks, profile, history, categories) | Query scoping via `auth()->id()` |
| Input validation | All write endpoints | Laravel Form Requests |
| CORS | All endpoints | Laravel CORS config (`cors.php`) |
| Response formatting | All endpoints | API Resources matching TypeScript interfaces |
| Error handling | All endpoints | Consistent JSON error format (401/403/404/422/500) |

## Starter Template Evaluation

### Primary Technology Domain

API backend (PHP/Laravel) — serving existing React 19 frontend via JSON REST endpoints.

### Starter Options Considered

| Option | Description | Verdict |
|--------|-------------|---------|
| `composer create-project laravel/laravel` | Vanilla Laravel 12 — clean slate, no frontend opinions | ✅ Best fit |
| Laravel Breeze (API stack) | Auth scaffolding with API routes | ❌ Over-opinionated |
| Laravel Jetstream | Full application starter with teams | ❌ Way too heavy |

### Selected Starter: Vanilla Laravel 12

**Rationale:** Clean API-only backend. No blade views, no frontend assets. Sanctum added via `php artisan install:api`.

**Initialization Commands:**

```bash
composer create-project laravel/laravel backend
cd backend
php artisan install:api
```

**Architectural Decisions Provided by Starter:**

- **Language & Runtime:** PHP 8.2+ with Laravel 12, Eloquent ORM, Artisan CLI
- **Database:** SQLite via `.env` config, Eloquent migrations, seeding infrastructure
- **Auth:** Sanctum via `install:api`, `HasApiTokens` trait, Bearer token via `Authorization` header
- **Testing:** PHPUnit + Pest, feature/unit test directories, HTTP test helpers
- **Code Organization:** Controllers, Models, Form Requests, API Resources, Middleware, Migrations, Seeders, `routes/api.php`
- **Dev Experience:** `php artisan serve`, `.env` config, `make:*` generators, `tinker` REPL

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):** Data modeling, auth flow, API patterns — all resolved below.

**Deferred Decisions (Post-MVP):** API documentation, hosting/deployment, rate limiting, caching, queue workers.

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | SQLite via Eloquent | User-specified, swappable via `.env` |
| Modeling | Eloquent models with relationships | Laravel standard, matches TypeScript interfaces 1:1 |
| Validation | Laravel Form Requests | Per-endpoint validation, returns 422 with field errors |
| Migrations | Laravel migrations (sequential) | Standard approach |
| Seeding | Laravel seeders | Migrate `TOOLS_DATA`, `DIRECTORY_DATA`, default categories from frontend constants |
| Activity Logging | Dedicated `activity_logs` table | Record user actions (login, CRUD) with actor, action, subject, metadata |
| Caching | None for MVP | SQLite scale doesn't warrant caching |

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth method | Sanctum Bearer Token | User-specified, stateless |
| Token expiration | Never expire — manual logout only | Simplest, user controls session |
| Password hashing | bcrypt (Laravel default) | Industry standard |
| Authorization | Custom `AdminMiddleware` checking `$user->role === 'admin'` | Simple 2-role system |
| Default role | `'user'` on registration; admin promotion via admin endpoints only | Secure by default |
| Data scoping | All user queries scoped by `auth()->id()` | Prevent cross-user data access |
| CORS | Laravel `cors.php` — allow `localhost:5173` + production origin | Vite dev + deploy |
| Input validation | Form Requests on all write endpoints | Prevents injection, validates types |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API style | REST JSON | Matches frontend fetch patterns |
| Response format | Laravel API Resources | Transform models to match TypeScript interfaces |
| Error format | Consistent JSON: `{ message, errors? }` | Field-level errors on 422 |
| Pagination | Laravel offset pagination on list endpoints | `?page=` on admin users, tasks |
| API docs | None for MVP | Solo developer, PRD serves as spec |
| API versioning | None | Single consumer |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting | Local only for MVP | Development phase |
| Dev server | `php artisan serve` (port 8000) | Laravel built-in |
| Environment | `.env` file | Laravel standard |
| Logging | Laravel default (daily log files) | Sufficient for MVP |
| Scheduler | Laravel Task Scheduling via cron | Task reset cycles |
| CI/CD | Deferred | Local only |

### Decision Impact — Implementation Sequence

1. Project init (`composer create-project` + `install:api`)
2. Database schema (migrations for all 7 models including activity_logs)
3. Auth flow (register/login/logout) + activity log recording
4. Core entity (Task CRUD + history + toggle) + activity log recording
5. Dashboard (computed aggregations)
6. Supporting entities (Directory, Tools, Categories, Profile)
7. Admin endpoints (including activity logs query)
8. AI proxy
9. Seeders (tools, directory data)
10. Scheduler (task reset cycles)

### Cross-Component Dependencies

- All controllers depend on auth middleware → Auth must be first
- Dashboard depends on tasks table → Tasks before dashboard
- Admin stats depend on all models → Admin endpoints last
- Seeders depend on migrations → Migrations before seeders

## Implementation Patterns & Consistency Rules

### JSON Response Format

API Resources transform database snake_case to **camelCase** in JSON responses to match frontend TypeScript interfaces. Database columns remain snake_case (Laravel convention).

### Naming Patterns

| Area | Convention | Example |
|------|-----------|---------|
| Database tables | snake_case, plural | `tasks`, `task_histories`, `directory_items` |
| Database columns | snake_case | `current_value`, `reset_cycle`, `user_id` |
| Foreign keys | `{model}_id` | `user_id`, `task_id`, `parent_id` |
| Models | PascalCase, singular | `Task`, `TaskHistory`, `DirectoryItem` |
| Controllers | PascalCase + `Controller` | `TaskController`, `AdminUserController` |
| Form Requests | PascalCase + `Request` | `StoreTaskRequest`, `UpdateProfileRequest` |
| API Resources | PascalCase + `Resource` | `TaskResource`, `DashboardResource` |
| Middleware | PascalCase | `AdminMiddleware` |
| Seeders | PascalCase + `Seeder` | `ToolSeeder`, `DirectorySeeder` |
| Routes | kebab-case, plural | `/api/tasks`, `/api/directory`, `/api/admin/users` |
| JSON response keys | camelCase | `hasLimit`, `currentValue`, `resetCycle` |
| JSON request keys | camelCase (Form Request maps to snake) | Frontend sends camelCase |

### API Response Patterns

**Success (single):** `{ "data": { "id": 1, "text": "...", "hasLimit": true } }`
**Success (collection):** `{ "data": [...], "meta": { "currentPage": 1, "lastPage": 5 } }`
**Success (action):** `{ "message": "Task deleted successfully" }`
**Error (422):** `{ "message": "Validation failed", "errors": { "text": ["Required."] } }`
**Error (401):** `{ "message": "Unauthenticated." }`
**Error (403):** `{ "message": "Unauthorized." }`

### Structure Patterns

| Location | Purpose |
|----------|---------|
| `app/Http/Controllers/Api/` | All API controllers |
| `app/Http/Controllers/Api/Admin/` | Admin-only controllers |
| `app/Http/Requests/` | Form Request validation classes |
| `app/Http/Resources/` | API Resource transformers |
| `app/Http/Middleware/` | Custom middleware (`AdminMiddleware`) |
| `app/Models/` | Eloquent models |
| `app/Services/` | Business logic (`DashboardService`, `AiProxyService`) |
| `database/migrations/` | Schema migrations |
| `database/seeders/` | Data seeders |
| `routes/api.php` | All API routes |
| `tests/Feature/` | API integration tests |

### Process Patterns

- **Thin controllers:** Logic in services where complex, simple CRUD inline
- **Data ownership:** Always scope via `auth()->user()->relationship()`, never `Model::all()`
- **Date format:** ISO 8601 in JSON (`2026-02-11T14:30:00Z`), Carbon internally

### Enforcement Guidelines

All AI Agents MUST:
- Use API Resources for ALL responses (never raw Eloquent models)
- Use Form Requests for ALL write endpoints (never validate in controller)
- Scope all user data queries through `auth()->user()->relationship()`
- Use camelCase for JSON keys, snake_case for database columns
- Place controllers under `Api/` namespace, admin under `Api/Admin/`
- Use Services for logic more complex than basic CRUD

## Project Structure & Boundaries

### Complete Project Directory Structure

```
backend/
├── .env
├── .env.example
├── .gitignore
├── composer.json
├── artisan
├── phpunit.xml
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php              ← FR1-3
│   │   │       ├── TaskController.php               ← FR6-17
│   │   │       ├── CategoryController.php           ← FR18
│   │   │       ├── DashboardController.php          ← FR19-22
│   │   │       ├── DirectoryController.php          ← FR23-28
│   │   │       ├── ToolController.php               ← FR29-32
│   │   │       ├── AiController.php                 ← FR33-36
│   │   │       ├── ProfileController.php            ← FR37-41
│   │   │       └── Admin/
│   │   │           ├── StatsController.php          ← FR42-43
│   │   │           ├── UserController.php           ← FR44-46
│   │   │           └── ToolController.php           ← FR47
│   │   ├── Middleware/
│   │   │   └── AdminMiddleware.php                  ← FR5
│   │   ├── Requests/
│   │   │   ├── Auth/
│   │   │   │   ├── RegisterRequest.php
│   │   │   │   └── LoginRequest.php
│   │   │   ├── Task/
│   │   │   │   ├── StoreTaskRequest.php
│   │   │   │   ├── UpdateTaskRequest.php
│   │   │   │   └── UpdateHistoryRequest.php
│   │   │   ├── Directory/
│   │   │   │   ├── StoreDirectoryRequest.php
│   │   │   │   └── UpdateDirectoryRequest.php
│   │   │   ├── Profile/
│   │   │   │   └── UpdateProfileRequest.php
│   │   │   └── Admin/
│   │   │       ├── StoreUserRequest.php
│   │   │       ├── UpdateUserRequest.php
│   │   │       ├── StoreToolRequest.php
│   │   │       └── UpdateToolRequest.php
│   │   └── Resources/
│   │       ├── TaskResource.php
│   │       ├── TaskHistoryResource.php
│   │       ├── CategoryResource.php
│   │       ├── DashboardResource.php
│   │       ├── DirectoryResource.php
│   │       ├── ToolResource.php
│   │       ├── ProfileResource.php
│   │       ├── UserResource.php
│   │       └── ActivityLogResource.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Task.php
│   │   ├── TaskHistory.php
│   │   ├── Category.php
│   │   ├── DirectoryItem.php
│   │   ├── Tool.php
│   │   └── ActivityLog.php
│   ├── Services/
│   │   ├── DashboardService.php
│   │   ├── AiProxyService.php
│   │   ├── TaskResetService.php
│   │   └── ActivityLogService.php
│   └── Console/
│       └── Commands/
│           └── ResetTasksCommand.php
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 2026_02_11_000001_create_categories_table.php
│   │   ├── 2026_02_11_000002_create_tasks_table.php
│   │   ├── 2026_02_11_000003_create_task_histories_table.php
│   │   ├── 2026_02_11_000004_create_directory_items_table.php
│   │   ├── 2026_02_11_000005_create_tools_table.php
│   │   └── 2026_02_11_000006_create_activity_logs_table.php
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── ToolSeeder.php
│   │   ├── DirectorySeeder.php
│   │   └── CategorySeeder.php
│   └── database.sqlite
├── routes/
│   ├── api.php
│   ├── console.php
│   └── web.php
├── config/
│   ├── cors.php
│   ├── sanctum.php
│   └── services.php
├── bootstrap/
│   └── app.php
└── tests/
    └── Feature/
        ├── Auth/
        │   ├── RegisterTest.php
        │   ├── LoginTest.php
        │   └── LogoutTest.php
        ├── Task/
        │   ├── TaskCrudTest.php
        │   ├── TaskToggleTest.php
        │   └── TaskHistoryTest.php
        ├── DashboardTest.php
        ├── DirectoryTest.php
        ├── ToolTest.php
        ├── ProfileTest.php
        └── Admin/
            ├── AdminUserTest.php
            ├── AdminToolTest.php
            └── AdminStatsTest.php
```

### Requirements to Structure Mapping

| FR Category | Controllers | Models | Services | Seeders |
|------------|------------|--------|----------|---------|
| Identity & Access (FR1-5) | `AuthController`, `AdminMiddleware` | `User` | — | — |
| Task Management (FR6-18) | `TaskController`, `CategoryController` | `Task`, `TaskHistory`, `Category` | `TaskResetService` | `CategorySeeder` |
| Performance Monitoring (FR19-22) | `DashboardController` | — (queries Task) | `DashboardService` | — |
| Knowledge Directory (FR23-28) | `DirectoryController` | `DirectoryItem` | — | `DirectorySeeder` |
| Tools Catalog (FR29-32) | `ToolController` | `Tool` | — | `ToolSeeder` |
| AI Assistance (FR33-36) | `AiController` | — | `AiProxyService` | — |
| User Preferences (FR37-41) | `ProfileController` | `User` (extended) | — | — |
| Platform Admin (FR42-47) | `Admin/*Controller` | `ActivityLog` | `ActivityLogService` | — |

### Data Flow

```
Frontend (React 19, port 5173)
    ↓ HTTP + Bearer Token + CORS
backend/routes/api.php
    ↓ auth:sanctum → AdminMiddleware (admin only)
Controllers (thin) → Form Request validation
    ↓ Services (complex) or direct Eloquent
Models (scoped by auth()->user())
    ↓
SQLite database
```

### External Integrations

| Integration | Location | Config |
|------------|----------|--------|
| Gemini AI API | `AiProxyService` | `GEMINI_API_KEY` in `.env`, 30s timeout |
| Frontend CORS | `config/cors.php` | `localhost:5173` + production domain |

## Architecture Validation Results

### Coherence Validation ✅

All technology choices (Laravel 12, SQLite, Sanctum, Eloquent) are first-party Laravel ecosystem — fully compatible. Patterns (snake_case DB → camelCase JSON, PascalCase classes, Form Requests + API Resources) are consistent throughout. Structure aligns with namespace boundaries and middleware isolation.

### Requirements Coverage ✅

All 47 FRs and 16 NFRs have explicit architectural support with zero gaps. Every FR category maps to specific controllers, models, services, and seeders. Activity logs (FR43) backed by dedicated `ActivityLog` model and `ActivityLogService`. User theme preference (FR41) stored on `User` model. Default role (FR4) is `'user'` on registration.

### Implementation Readiness ✅

- All tech versions specified (Laravel 12, PHP 8.2+, Sanctum)
- 6 mandatory enforcement rules for AI agents
- Every file named with FR mapping in project tree
- Data flow documented end-to-end

### Readiness Assessment

**Status:** READY FOR IMPLEMENTATION — High confidence

**Strengths:** 1:1 TypeScript-to-backend mapping, complete FR traceability, Laravel conventions handle 90% of decisions

**Future Enhancement:** API docs, caching, queue for AI, rate limiting (all post-MVP)
