---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
workflowType: 'epics'
project_name: 'MSYV2'
user_name: 'Tubagus'
date: '2026-02-12'
---

# MSYV2 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for MSYV2, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Visitors can register a new account with name, email, and password
FR2: Users can authenticate with email and password to receive a bearer token
FR3: Users can terminate their session (invalidate token)
FR4: System assigns a default role of 'user' to new accounts; admins can promote accounts to 'admin' role
FR5: System restricts admin-only capabilities to accounts with admin role
FR6: Users can create tasks with description, category, and reset cycle
FR7: Users can configure tasks with numeric targets (target value, unit, increment value)
FR8: Users can view their tasks with filtering by category and text search
FR9: Users can toggle task completion (binary or incremental progress)
FR10: Users can update task details after creation
FR11: Users can delete tasks
FR12: System records a history entry each time task progress changes
FR13: Users can view the history log of a task
FR14: Users can edit individual history entries
FR15: Users can delete individual history entries
FR16: System recalculates task progress when history entries are modified
FR17: System auto-resets recurring tasks based on their cycle (daily/weekly/monthly/yearly)
FR18: Users can manage task categories (view default set)
FR19: Users can view a dashboard of KPI metrics computed from their task data
FR20: Users can view goal progress computed from their task categories and targets
FR21: Users can view chart data showing task completion trends over time
FR22: Dashboard data updates reflect current task state without manual refresh
FR23: Users can browse the Islamic knowledge directory as a navigable tree
FR24: Users can view detail content of any directory item
FR25: Users can create new directory items within the tree
FR26: Users can update existing directory items
FR27: Users can delete directory items
FR28: System provides pre-seeded directory content on initial setup
FR29: Users can browse all available tools
FR30: Users can filter tools by category
FR31: Users can view detailed information about a tool (description, inputs, outputs, benefits, shariah basis, related dalil)
FR32: System provides pre-seeded tools catalog on initial setup
FR33: Users can have a conversational chat with an AI assistant on muamalah topics
FR34: Users can generate strategic plans using AI based on their goals
FR35: Users can receive AI-generated insights based on their KPI and goal data
FR36: System proxies all AI requests server-side (API keys never exposed to client)
FR37: Users can view and update their profile (name, profile picture URL)
FR38: Users can configure shariah preferences (zakat rate, preferred akad, calendar method)
FR39: Users can export all their data as a downloadable file
FR40: Users can reset all their data
FR41: Users can set visual theme preference (light/dark)
FR42: Admins can view platform-wide statistics (total users, total tasks, activity summary)
FR43: Admins can view system activity logs (login, task CRUD, user management actions recorded with actor, action, subject, and timestamp)
FR44: Admins can list, create, update, and delete user accounts
FR45: Admins can manage user roles
FR46: Admins can export user data
FR47: Admins can list, create, update, and delete tools in the catalog

### NonFunctional Requirements

NFR1: API endpoints return responses within 500ms under normal load
NFR2: Dashboard aggregation endpoint returns within 1 second for up to 1,000 tasks per user
NFR3: Authentication endpoints respond within 300ms
NFR4: AI proxy endpoints may take up to 30s due to external Gemini API — frontend handles loading states
NFR5: All API communication over HTTPS
NFR6: Passwords hashed using bcrypt (Laravel default)
NFR7: Bearer tokens are the sole authentication mechanism — no session cookies
NFR8: Gemini API key stored server-side in `.env`, never included in API responses
NFR9: Users can only access their own data — enforced at query level
NFR10: Admin routes protected by role-checking middleware
NFR11: Input validation on all endpoints to prevent injection and malformed data
NFR12: CORS restricted to allowed frontend origins only
NFR13: Backend exposes JSON REST API consumable by the React 19 frontend
NFR14: CORS configured for Vite dev server (localhost:5173) and production domain
NFR15: Gemini API integration uses server-side HTTP client with timeout and error handling
NFR16: API response shapes match existing TypeScript interfaces in `frontend/src/types/index.ts`

### Additional Requirements

From Architecture document:

- **Starter Template:** Vanilla Laravel 12 via `composer create-project laravel/laravel backend` + `php artisan install:api` for Sanctum
- **Database:** SQLite via Eloquent, swappable via `.env` config
- **Activity Logging:** Dedicated `activity_logs` table with ActivityLog model and ActivityLogService — records login, CRUD actions with actor, action, subject_type, subject_id, metadata
- **Default Role:** `'user'` on registration; admin promotion via admin endpoints only
- **Token Expiration:** Never expire — manual logout only
- **JSON Response Format:** camelCase keys via API Resources (database remains snake_case)
- **JSON Request Format:** camelCase from frontend, Form Requests map to snake_case internally
- **Thin Controllers:** Logic in Services where complex (DashboardService, AiProxyService, TaskResetService, ActivityLogService), simple CRUD inline
- **Data Ownership:** Always scope via `auth()->user()->relationship()`, never `Model::all()`
- **Enforcement Rules:** Use API Resources for ALL responses, Form Requests for ALL writes, scope all queries through auth user
- **Task Reset Scheduler:** Laravel Task Scheduling via cron for daily/weekly/monthly/yearly task resets
- **Seeders Required:** ToolSeeder (25+ tools from constants), DirectorySeeder (tree from constants), CategorySeeder (default categories)
- **CORS Config:** `cors.php` allowing `localhost:5173` + production domain
- **Gemini AI Proxy:** Server-side HTTP client, 30s timeout, API key in `.env`, graceful degradation
- **Profile & Settings:** Single `PUT /api/profile` endpoint handles all user preferences (name, profile picture, theme, shariah settings)
- **User Model Extended Fields:** theme (default: 'light'), profile_picture, zakat_rate, preferred_akad, calculation_method
- **Test Coverage:** Feature tests for Auth, Task CRUD/Toggle/History, Dashboard, Directory, Tools, Profile, Admin Users, Admin Tools, Admin Stats

### FR Coverage Map

FR1  → Epic 1 — Register account
FR2  → Epic 1 — Login with bearer token
FR3  → Epic 1 — Logout (invalidate token)
FR4  → Epic 1 — Default role assignment ('user')
FR5  → Epic 1 — Admin-only route restriction
FR6  → Epic 2 — Create tasks
FR7  → Epic 2 — Configure numeric targets
FR8  → Epic 2 — View/filter tasks
FR9  → Epic 2 — Toggle task completion
FR10 → Epic 2 — Update tasks
FR11 → Epic 2 — Delete tasks
FR12 → Epic 2 — Auto-record history on progress
FR13 → Epic 2 — View task history
FR14 → Epic 2 — Edit history entries
FR15 → Epic 2 — Delete history entries
FR16 → Epic 2 — Recalculate progress on history change
FR17 → Epic 2 — Auto-reset recurring tasks
FR18 → Epic 2 — Manage categories
FR19 → Epic 3 — Dashboard KPI metrics
FR20 → Epic 3 — Goal progress
FR21 → Epic 3 — Chart trend data
FR22 → Epic 3 — Real-time dashboard refresh
FR23 → Epic 5 — Browse directory tree
FR24 → Epic 5 — View directory item detail
FR25 → Epic 5 — Create directory items
FR26 → Epic 5 — Update directory items
FR27 → Epic 5 — Delete directory items
FR28 → Epic 5 — Pre-seeded directory content
FR29 → Epic 6 — Browse tools
FR30 → Epic 6 — Filter tools by category
FR31 → Epic 6 — View tool detail
FR32 → Epic 6 — Pre-seeded tools catalog
FR33 → Epic 7 — AI conversational chat
FR34 → Epic 7 — AI plan generation
FR35 → Epic 7 — AI insights from KPI/goal data
FR36 → Epic 7 — Server-side AI proxy
FR37 → Epic 4 — View/update profile
FR38 → Epic 4 — Configure shariah preferences
FR39 → Epic 4 — Export data
FR40 → Epic 4 — Reset data
FR41 → Epic 4 — Theme preference
FR42 → Epic 8 — Admin platform stats
FR43 → Epic 8 — Admin activity logs
FR44 → Epic 8 — Admin user CRUD
FR45 → Epic 8 — Admin role management
FR46 → Epic 8 — Admin user export
FR47 → Epic 8 — Admin tool CRUD

## Epic List

### Epic 1: Project Foundation & User Authentication
Users can register, login, and logout with secure bearer token authentication. The system enforces role-based access control with default 'user' role and admin-restricted routes.
**FRs covered:** FR1, FR2, FR3, FR4, FR5
**NFRs addressed:** NFR3, NFR5, NFR6, NFR7, NFR9, NFR10, NFR11, NFR12, NFR13, NFR14, NFR16
**Dependencies:** None — standalone foundation

### Epic 2: Task Management & Progress Tracking
Users can create, manage, and track tasks (Tugas Amanah) with full CRUD, numeric targets, toggle-based progress, complete history management, auto-reset cycles, and category filtering.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18
**NFRs addressed:** NFR1, NFR11
**Dependencies:** Epic 1 (auth)

### Epic 3: Dashboard & Performance Insights
Users can view their performance dashboard with KPI metrics, goal progress, and chart trend data — all computed in real-time from their task data.
**FRs covered:** FR19, FR20, FR21, FR22
**NFRs addressed:** NFR2
**Dependencies:** Epic 2 (tasks must exist)

### Epic 4: User Profile & Preferences
Users can personalize their experience by managing profile info, shariah preferences, visual theme, and can export or reset all their data.
**FRs covered:** FR37, FR38, FR39, FR40, FR41
**NFRs addressed:** NFR1
**Dependencies:** Epic 1 (auth)

### Epic 5: Knowledge Directory
Users can browse, create, edit, and delete items in the Islamic knowledge directory tree, with pre-seeded content available on initial setup.
**FRs covered:** FR23, FR24, FR25, FR26, FR27, FR28
**NFRs addressed:** NFR1
**Dependencies:** Epic 1 (auth)

### Epic 6: Tools Catalog
Users can discover and explore Islamic productivity tools with category filtering and detailed tool information, backed by pre-seeded catalog data.
**FRs covered:** FR29, FR30, FR31, FR32
**NFRs addressed:** NFR1
**Dependencies:** Epic 1 (auth)

### Epic 7: AI Assistant & Intelligence
Users can chat with an AI assistant on muamalah topics, generate strategic plans, and receive data-driven insights — all securely proxied through the backend.
**FRs covered:** FR33, FR34, FR35, FR36
**NFRs addressed:** NFR4, NFR8, NFR15
**Dependencies:** Epic 1 (auth)

### Epic 8: Platform Administration
Admins can manage users (CRUD + roles + export), manage tools catalog (CRUD), view platform-wide statistics, and monitor system activity logs.
**FRs covered:** FR42, FR43, FR44, FR45, FR46, FR47
**NFRs addressed:** NFR10
**Dependencies:** Epics 1-7 (admin manages all entities)

---

## Epic 1: Project Foundation & User Authentication

Users can register, login, and logout with secure bearer token authentication. The system enforces role-based access control with default 'user' role and admin-restricted routes.

### Story 1.1: Laravel Project Initialization

As a developer,
I want a properly configured Laravel 12 backend with Sanctum, SQLite, and CORS,
So that all future API development has a working foundation.

**Acceptance Criteria:**

**Given** the project root exists with a `frontend/` folder
**When** the backend is initialized via `composer create-project laravel/laravel backend` and `php artisan install:api`
**Then** the `backend/` folder contains a working Laravel 12 application
**And** SQLite is configured as the database in `.env`
**And** Sanctum is installed and configured for Bearer token auth only (sessions/cookies disabled)
**And** CORS is configured in `config/cors.php` allowing `localhost:5173` and production origins
**And** the User migration includes columns: name, email, password, role (string, default: 'user'), theme (string, default: 'light'), profile_picture (nullable string), zakat_rate (nullable decimal), preferred_akad (nullable string), calculation_method (nullable string)
**And** the ActivityLog migration is created with columns: id, user_id (foreign), action (string), subject_type (nullable string), subject_id (nullable integer), metadata (nullable JSON), created_at
**And** the ActivityLog model and ActivityLogService are created
**And** `php artisan migrate` runs successfully creating users, personal_access_tokens, and activity_logs tables
**And** API Resources use camelCase keys for all JSON responses

### Story 1.2: User Registration

As a visitor,
I want to register with my name, email, and password,
So that I can create an account and start using the platform.

**Acceptance Criteria:**

**Given** a visitor is not authenticated
**When** they POST to `/api/auth/register` with valid name, email, and password
**Then** a new User is created with role defaulting to `'user'`
**And** a Sanctum bearer token is returned in the response body
**And** the response includes the user profile data (id, name, email, role)
**And** the password is hashed with bcrypt (never stored in plain text)
**And** an activity log entry is recorded with action `'user.registered'`

**Given** a visitor provides an already-used email
**When** they POST to `/api/auth/register`
**Then** a 422 response is returned with field-level error on `email`

**Given** a visitor provides invalid input (missing name, password < 8 chars, invalid email format)
**When** they POST to `/api/auth/register`
**Then** a 422 response is returned with specific field-level validation errors via RegisterRequest

### Story 1.3: User Login

As a registered user,
I want to login with my email and password,
So that I receive a bearer token to access protected resources.

**Acceptance Criteria:**

**Given** a registered user exists
**When** they POST to `/api/auth/login` with correct email and password
**Then** a Sanctum bearer token is returned in the response body
**And** the response includes the user profile data (id, name, email, role)
**And** the response time is within 300ms (NFR3)
**And** an activity log entry is recorded with action `'user.login'`

**Given** a user provides wrong email or password
**When** they POST to `/api/auth/login`
**Then** a 401 response is returned with message "Invalid credentials"

**Given** a user provides missing or invalid fields
**When** they POST to `/api/auth/login`
**Then** a 422 response is returned with field-level validation errors via LoginRequest

### Story 1.4: User Logout

As an authenticated user,
I want to logout,
So that my bearer token is invalidated and my session ends.

**Acceptance Criteria:**

**Given** a user is authenticated with a valid bearer token
**When** they POST to `/api/auth/logout`
**Then** the current token is deleted/invalidated
**And** a success message is returned: `{ "message": "Logged out successfully" }`
**And** subsequent requests with the same token return 401
**And** an activity log entry is recorded with action `'user.logout'`

**Given** a request has no token or an invalid token
**When** they POST to `/api/auth/logout`
**Then** a 401 response is returned with message "Unauthenticated."

### Story 1.5: Admin Route Protection Middleware

As the system,
I want to enforce admin-only access on restricted routes,
So that regular users cannot access platform administration features.

**Acceptance Criteria:**

**Given** an `AdminMiddleware` exists at `app/Http/Middleware/AdminMiddleware.php`
**When** a request hits an admin-protected route with a user whose role is `'admin'`
**Then** the request proceeds normally to the controller

**Given** an authenticated user with role `'user'`
**When** they attempt to access any route under `/api/admin/*`
**Then** a 403 response is returned with message "Unauthorized"

**Given** an unauthenticated request (no token or invalid token)
**When** it hits an admin-protected route
**Then** a 401 response is returned with message "Unauthenticated."

**And** the middleware is registered and applied to the `api/admin` route group in `routes/api.php`

---

## Epic 2: Task Management & Progress Tracking

Users can create, manage, and track tasks (Tugas Amanah) with full CRUD, numeric targets, toggle-based progress, complete history management, auto-reset cycles, and category filtering.

### Story 2.1: Task Categories

As a user,
I want to view my task categories,
So that I can organize tasks into meaningful groups.

**Acceptance Criteria:**

**Given** the categories migration creates a `categories` table with columns: id, user_id (foreign), name (string)
**When** a new user is created
**Then** default categories are seeded for that user via CategorySeeder (SDM, Keuangan, Kepatuhan, Pemasaran, Operasional, Teknologi)

**Given** an authenticated user
**When** they GET `/api/categories`
**Then** only their own categories are returned (scoped by `auth()->user()->categories()`)
**And** the response uses CategoryResource with camelCase keys
**And** the response format is `{ "data": [...] }`

**Given** an unauthenticated request
**When** they GET `/api/categories`
**Then** a 401 response is returned

### Story 2.2: Create Tasks

As a user,
I want to create tasks with descriptions, categories, reset cycles, and optional numeric targets,
So that I can track my Islamic business compliance activities.

**Acceptance Criteria:**

**Given** the tasks migration creates a `tasks` table with columns: id, user_id (foreign), text (string), completed (boolean, default false), category (string), progress (integer, default 0), has_limit (boolean, default false), current_value (integer, default 0), target_value (integer, nullable), unit (string, nullable), reset_cycle (string, nullable — daily/weekly/monthly/yearly), per_check_enabled (boolean, default false), increment_value (integer, default 1), last_reset_at (timestamp, nullable), created_at, updated_at
**When** an authenticated user POSTs to `/api/tasks` with valid data
**Then** a new task is created scoped to that user
**And** the response returns the created task via TaskResource with status 201
**And** an activity log entry is recorded with action `'task.created'`

**Given** a user provides a task with `hasLimit: true`
**When** they POST to `/api/tasks` with targetValue, unit, and incrementValue
**Then** the task is created with numeric target configuration

**Given** a user provides invalid data (missing text, invalid category, invalid resetCycle)
**When** they POST to `/api/tasks`
**Then** a 422 response is returned with field-level errors via StoreTaskRequest

### Story 2.3: View and Filter Tasks

As a user,
I want to view my tasks with filtering by category and text search,
So that I can quickly find and manage specific tasks.

**Acceptance Criteria:**

**Given** an authenticated user has tasks
**When** they GET `/api/tasks`
**Then** only their own tasks are returned (scoped by `auth()->user()->tasks()`)
**And** the response uses TaskResource collection with camelCase keys

**Given** a user wants to filter by category
**When** they GET `/api/tasks?category=Keuangan`
**Then** only tasks matching that category are returned

**Given** a user wants to search by text
**When** they GET `/api/tasks?search=zakat`
**Then** only tasks whose text contains the search term are returned

**Given** a user wants to filter by reset cycle
**When** they GET `/api/tasks?cycle=daily`
**Then** only tasks with that reset cycle are returned

**Given** multiple filters are combined
**When** they GET `/api/tasks?category=Keuangan&search=zakat`
**Then** results match ALL applied filters

### Story 2.4: Update and Delete Tasks

As a user,
I want to update task details or delete tasks,
So that I can keep my task list accurate and current.

**Acceptance Criteria:**

**Given** an authenticated user owns a task
**When** they PUT `/api/tasks/{id}` with updated fields
**Then** the task is updated and the response returns the updated task via TaskResource
**And** validation is applied via UpdateTaskRequest
**And** an activity log entry is recorded with action `'task.updated'`

**Given** a user tries to update a task they do not own
**When** they PUT `/api/tasks/{id}`
**Then** a 404 response is returned (query scoping prevents access)

**Given** an authenticated user owns a task
**When** they DELETE `/api/tasks/{id}`
**Then** the task and all its history entries are deleted (cascade)
**And** a success message is returned
**And** an activity log entry is recorded with action `'task.deleted'`

**Given** a user tries to delete a task they do not own
**When** they DELETE `/api/tasks/{id}`
**Then** a 404 response is returned

### Story 2.5: Toggle Task Completion with History Recording

As a user,
I want to toggle my task completion (binary or incremental),
So that I can track my daily progress and the system records my activity history.

**Acceptance Criteria:**

**Given** the task_histories migration creates a `task_histories` table with columns: id, task_id (foreign, cascade delete), value (integer), note (string, nullable), timestamp (timestamp, default now), created_at, updated_at
**And** the TaskHistory model is created with relationship to Task

**Given** a task with `hasLimit: false` (binary toggle)
**When** the user PATCHes `/api/tasks/{id}/toggle`
**Then** the task's `completed` field is toggled (true ↔ false)
**And** a TaskHistory entry is automatically created recording the change (FR12)
**And** the response returns the updated task via TaskResource

**Given** a task with `hasLimit: true` and `incrementValue: 5`
**When** the user PATCHes `/api/tasks/{id}/toggle`
**Then** `currentValue` is incremented by `incrementValue`
**And** if `currentValue >= targetValue`, the task is marked `completed: true`
**And** `progress` is recalculated as `(currentValue / targetValue) * 100`
**And** a TaskHistory entry is recorded with the new value

**Given** an authenticated user owns a task with history entries
**When** they GET `/api/tasks/{id}` (or task includes history)
**Then** the task's history entries are included/accessible (FR13)
**And** history is returned via TaskHistoryResource collection

### Story 2.6: Edit and Delete History Entries

As a user,
I want to edit or delete individual history entries,
So that I can correct mistakes and the system recalculates my task progress accurately.

**Acceptance Criteria:**

**Given** an authenticated user owns a task with history entries
**When** they PUT `/api/tasks/{id}/history/{entryId}` with updated value and/or note
**Then** the history entry is updated via UpdateHistoryRequest validation
**And** the parent task's `currentValue` and `progress` are recalculated from all remaining history entries (FR16)
**And** the response returns the updated history entry

**Given** an authenticated user owns a task with history entries
**When** they DELETE `/api/tasks/{id}/history/{entryId}`
**Then** the history entry is deleted
**And** the parent task's `currentValue` and `progress` are recalculated from remaining entries (FR16)
**And** if no entries remain, `currentValue` resets to 0 and `completed` to false

**Given** a user tries to access history of a task they don't own
**When** they PUT or DELETE a history entry
**Then** a 404 response is returned (ownership scoping)

### Story 2.7: Automated Task Reset Scheduler

As the system,
I want to auto-reset recurring tasks based on their cycle,
So that users' daily/weekly/monthly/yearly tasks start fresh at the appropriate interval.

**Acceptance Criteria:**

**Given** a `ResetTasksCommand` artisan command exists
**When** it runs via Laravel's task scheduler
**Then** it queries all tasks where `reset_cycle` is not null and the cycle period has elapsed since `last_reset_at`
**And** for each matching task: `completed` is set to false, `current_value` to 0, `progress` to 0
**And** `last_reset_at` is updated to the current timestamp
**And** the command uses `TaskResetService` for the reset logic

**Given** a task with `reset_cycle: 'daily'` and `last_reset_at` was yesterday
**When** the scheduler runs
**Then** the task is reset

**Given** a task with `reset_cycle: 'weekly'` and `last_reset_at` was 3 days ago
**When** the scheduler runs
**Then** the task is NOT reset (cycle not elapsed)

**And** the command is registered in `routes/console.php` or `app/Console/Kernel.php` to run daily

---

## Epic 3: Dashboard & Performance Insights

Users can view their performance dashboard with KPI metrics, goal progress, and chart trend data — all computed in real-time from their task data.

### Story 3.1: Dashboard KPI and Goal Computation

As a user,
I want to view my dashboard with KPI metrics and goal progress,
So that I can understand my overall Islamic business compliance performance at a glance.

**Acceptance Criteria:**

**Given** an authenticated user has tasks
**When** they GET `/api/dashboard`
**Then** the response includes computed KPI data:
- Total tasks count
- Completed tasks count
- Completion percentage
- Tasks by category with completion rates
- Kepatuhan Syariah score (% of compliance tasks completed)
**And** the response includes goal progress data:
- Per-category goal progress computed from tasks with targets
- Overall goal achievement percentage
**And** all metrics are computed live from the tasks table via `DashboardService` (no stored aggregates)
**And** the response uses DashboardResource with camelCase keys
**And** the response matches the frontend's TypeScript interfaces for Dashboard data
**And** the response time is within 1 second for up to 1,000 tasks (NFR2)

**Given** a user has no tasks
**When** they GET `/api/dashboard`
**Then** the response returns zeroed-out metrics (not an error)

### Story 3.2: Dashboard Chart Trend Data

As a user,
I want to view chart data showing my task completion trends over time,
So that I can track my performance trajectory visually.

**Acceptance Criteria:**

**Given** an authenticated user has tasks with history entries
**When** they GET `/api/dashboard` (chart data is part of the dashboard response)
**Then** the response includes chart trend data:
- Weekly completion counts (last 4-8 weeks)
- Aggregated from task_histories timestamps
- Formatted for frontend chart consumption (labels + values arrays)

**Given** a user has no history data
**When** they GET `/api/dashboard`
**Then** chart data returns empty arrays (not an error)

**And** chart computation is handled in `DashboardService`
**And** the response shape matches the frontend's chart component expectations

---

## Epic 4: User Profile & Preferences

Users can personalize their experience by managing profile info, shariah preferences, visual theme, and can export or reset all their data.

### Story 4.1: View and Update Profile

As a user,
I want to view and update my profile, shariah preferences, and theme,
So that the platform reflects my personal settings and Islamic finance preferences.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they GET `/api/profile`
**Then** the response returns their profile data via ProfileResource: name, email, role, theme, profilePicture, zakatRate, preferredAkad, calculationMethod
**And** sensitive fields (password, tokens) are never included

**Given** an authenticated user
**When** they PUT `/api/profile` with updated fields (name, profilePicture, theme, zakatRate, preferredAkad, calculationMethod)
**Then** only the provided fields are updated on their User model
**And** the response returns the updated profile via ProfileResource
**And** validation is applied via UpdateProfileRequest
**And** email and role cannot be changed through this endpoint

**Given** a user provides invalid data (invalid theme value, negative zakatRate)
**When** they PUT `/api/profile`
**Then** a 422 response is returned with field-level validation errors

### Story 4.2: Export User Data

As a user,
I want to export all my data as a downloadable file,
So that I have a backup of my tasks, history, categories, and profile.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they POST `/api/profile/export`
**Then** a JSON file is returned containing all their data:
- Profile information
- All tasks with their history entries
- All categories
**And** the response has appropriate download headers (Content-Disposition)
**And** only the requesting user's data is included (scoped by ownership)

**Given** a user has no tasks
**When** they POST `/api/profile/export`
**Then** the export still succeeds with empty arrays for tasks/history

### Story 4.3: Reset User Data

As a user,
I want to reset all my data,
So that I can start fresh without creating a new account.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they POST `/api/profile/reset`
**Then** all their tasks are deleted (with cascading history deletion)
**And** all their custom categories are deleted
**And** default categories are re-seeded for the user
**And** profile settings (zakatRate, preferredAkad, calculationMethod) are reset to null
**And** theme resets to 'light'
**And** the user account itself (email, password, name) is NOT deleted
**And** a success message is returned
**And** an activity log entry is recorded with action `'user.data_reset'`

---

## Epic 5: Knowledge Directory

Users can browse, create, edit, and delete items in the Islamic knowledge directory tree, with pre-seeded content available on initial setup.

### Story 5.1: Directory Browse and Seeded Content

As a user,
I want to browse the Islamic knowledge directory as a navigable tree,
So that I can find guidance on muamalah, contracts, and shariah compliance topics.

**Acceptance Criteria:**

**Given** the directory_items migration creates a table with columns: id, parent_id (nullable self-referential foreign key), title (string), type (string — 'folder' or 'item'), content (text, nullable), created_at, updated_at
**And** the DirectoryItem model is created with self-referential `parent`/`children` relationships
**And** a DirectorySeeder exists that seeds the complete tree from `frontend/src/constants/index.ts` DIRECTORY_DATA

**Given** an authenticated user
**When** they GET `/api/directory`
**Then** the complete directory tree is returned with nested children structure
**And** the response uses DirectoryResource with camelCase keys
**And** the tree structure matches the frontend's expected format

**Given** a user wants to view a specific item's detail
**When** they access a directory item (included in tree response or via separate lookup)
**Then** the item's full content, type, title, and children (if folder) are returned

### Story 5.2: Directory CRUD

As a user,
I want to create, update, and delete directory items,
So that I can customize the knowledge base with my own notes and references.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they POST `/api/directory` with title, type, content, and optional parentId
**Then** a new directory item is created and returned via DirectoryResource with status 201
**And** validation is applied via StoreDirectoryRequest

**Given** an authenticated user
**When** they PUT `/api/directory/{id}` with updated title, content, or parentId
**Then** the item is updated and returned via DirectoryResource
**And** validation is applied via UpdateDirectoryRequest

**Given** an authenticated user
**When** they DELETE `/api/directory/{id}`
**Then** the item and all its children are deleted (cascade)
**And** a success message is returned

**Given** a user provides invalid data (missing title, invalid type)
**When** they POST or PUT
**Then** a 422 response is returned with field-level errors

---

## Epic 6: Tools Catalog

Users can discover and explore Islamic productivity tools with category filtering and detailed tool information, backed by pre-seeded catalog data.

### Story 6.1: Tools Browse, Filter, and Detail

As a user,
I want to browse, filter, and view detailed information about Islamic productivity tools,
So that I can discover tools for zakat calculation, shariah contracts, and business compliance.

**Acceptance Criteria:**

**Given** the tools migration creates a table with columns: id, name (string), category (string), description (text), inputs (JSON), outputs (JSON), benefits (JSON), sharia_basis (text, nullable), link (string, nullable), related_directory_ids (JSON, nullable), related_dalil_text (text, nullable), related_dalil_source (string, nullable), created_at, updated_at
**And** the Tool model is created
**And** a ToolSeeder exists that seeds 25+ tools from `frontend/src/constants/index.ts` TOOLS_DATA

**Given** an authenticated user
**When** they GET `/api/tools`
**Then** all tools are returned via ToolResource collection
**And** the response format is `{ "data": [...] }`

**Given** a user wants to filter by category
**When** they GET `/api/tools?category=Keuangan`
**Then** only tools matching that category are returned

**Given** a user wants tool details
**When** they GET `/api/tools/{id}`
**Then** the complete tool information is returned via ToolResource including inputs, outputs, benefits, shariaBasis, relatedDalilText, relatedDalilSource

**Given** a tool ID does not exist
**When** they GET `/api/tools/{id}`
**Then** a 404 response is returned

---

## Epic 7: AI Assistant & Intelligence

Users can chat with an AI assistant on muamalah topics, generate strategic plans, and receive data-driven insights — all securely proxied through the backend.

### Story 7.1: AI Chat Proxy

As a user,
I want to chat with an AI assistant about muamalah and Islamic business topics,
So that I can get instant guidance without exposing API keys in my browser.

**Acceptance Criteria:**

**Given** an `AiProxyService` exists that handles Gemini API communication
**And** the `GEMINI_API_KEY` is stored in `.env` and never exposed in responses (NFR8)
**And** the HTTP client is configured with a 30-second timeout (NFR4)

**Given** an authenticated user
**When** they POST `/api/ai/chat` with a message/prompt
**Then** the request is proxied to the Gemini API via AiProxyService
**And** the AI response is returned to the user
**And** the response time may take up to 30s (frontend handles loading states)

**Given** the Gemini API is unreachable or returns an error
**When** a user sends a chat request
**Then** a graceful error response is returned (not a raw 500)
**And** the error message indicates the AI service is temporarily unavailable

**Given** a user sends an empty or invalid prompt
**When** they POST `/api/ai/chat`
**Then** a 422 response is returned with validation errors

### Story 7.2: AI Plan Generation and Insights

As a user,
I want to generate strategic plans and receive AI-powered insights based on my performance data,
So that I can make data-driven decisions for my Islamic business compliance strategy.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they POST `/api/ai/generate-plan` with goals/context data
**Then** the request is proxied to Gemini API with the plan generation prompt
**And** the AI-generated plan is returned to the user

**Given** an authenticated user
**When** they POST `/api/ai/insight` with KPI/goal data
**Then** the request is proxied to Gemini API with the insight generation prompt
**And** AI-generated insights are returned to the user

**Given** either endpoint receives invalid or missing input
**When** the POST is made
**Then** a 422 response is returned with validation errors

**And** both endpoints use AiProxyService with 30s timeout and graceful error handling
**And** both endpoints require `auth:sanctum` middleware

---

## Epic 8: Platform Administration

Admins can manage users (CRUD + roles + export), manage tools catalog (CRUD), view platform-wide statistics, and monitor system activity logs.

### Story 8.1: Admin Platform Statistics

As an admin,
I want to view platform-wide statistics,
So that I can monitor the health and usage of the SyariahOS platform.

**Acceptance Criteria:**

**Given** an authenticated admin user
**When** they GET `/api/admin/stats`
**Then** the response includes computed statistics:
- Total registered users
- Total tasks across all users
- Total completed tasks
- Active users (users who logged in within last 30 days, from activity_logs)
- Recent activity summary (last 10 activity log entries)
**And** the response uses appropriate Resource formatting with camelCase keys

**Given** a non-admin user
**When** they GET `/api/admin/stats`
**Then** a 403 response is returned

### Story 8.2: Admin Activity Logs

As an admin,
I want to view system activity logs,
So that I can audit user actions and monitor platform activity.

**Acceptance Criteria:**

**Given** an authenticated admin user
**When** they GET `/api/admin/logs`
**Then** paginated activity log entries are returned, ordered by most recent first
**And** each entry includes: user (name, email), action, subjectType, subjectId, metadata, createdAt
**And** the response uses ActivityLogResource with camelCase keys
**And** pagination meta is included (currentPage, lastPage, total)

**Given** an admin wants to filter logs
**When** they GET `/api/admin/logs?action=user.login` or `?user_id=5`
**Then** only matching log entries are returned

**Given** a non-admin user
**When** they GET `/api/admin/logs`
**Then** a 403 response is returned

### Story 8.3: Admin User Management

As an admin,
I want to list, create, update, and delete user accounts and manage their roles,
So that I can maintain the user base and control access levels.

**Acceptance Criteria:**

**Given** an authenticated admin
**When** they GET `/api/admin/users`
**Then** a paginated list of all users is returned via UserResource
**And** pagination supports `?page=` and `?search=` (search by name or email)

**Given** an authenticated admin
**When** they POST `/api/admin/users` with name, email, password, and role
**Then** a new user is created and returned with status 201
**And** validation is applied via StoreUserRequest
**And** an activity log entry is recorded with action `'admin.user_created'`

**Given** an authenticated admin
**When** they PUT `/api/admin/users/{id}` with updated fields (name, email, role)
**Then** the user is updated and returned via UserResource
**And** role can be changed between 'user' and 'admin' (FR45)
**And** validation is applied via UpdateUserRequest
**And** an activity log entry is recorded with action `'admin.user_updated'`

**Given** an authenticated admin
**When** they DELETE `/api/admin/users/{id}`
**Then** the user and all their data (tasks, history, categories) are deleted
**And** a success message is returned
**And** an activity log entry is recorded with action `'admin.user_deleted'`

**Given** a non-admin user attempts any admin user operation
**When** the request is made
**Then** a 403 response is returned

### Story 8.4: Admin User Export

As an admin,
I want to export user data,
So that I can generate reports or backups of the platform's user base.

**Acceptance Criteria:**

**Given** an authenticated admin
**When** they GET `/api/admin/users/export`
**Then** a JSON file is returned containing all users with their profile data (excluding passwords and tokens)
**And** the response has appropriate download headers (Content-Disposition)

**Given** a non-admin user
**When** they GET `/api/admin/users/export`
**Then** a 403 response is returned

### Story 8.5: Admin Tool Management

As an admin,
I want to create, update, and delete tools in the catalog,
So that I can keep the tools library current and relevant for users.

**Acceptance Criteria:**

**Given** an authenticated admin
**When** they GET `/api/admin/tools`
**Then** all tools are returned (same as user-facing, but accessible from admin context)

**Given** an authenticated admin
**When** they POST `/api/admin/tools` with tool data (name, category, description, inputs, outputs, benefits, shariaBasis, link, relatedDirectoryIds, relatedDalilText, relatedDalilSource)
**Then** a new tool is created and returned with status 201
**And** validation is applied via StoreToolRequest
**And** an activity log entry is recorded with action `'admin.tool_created'`

**Given** an authenticated admin
**When** they PUT `/api/admin/tools/{id}` with updated fields
**Then** the tool is updated and returned via ToolResource
**And** validation is applied via UpdateToolRequest
**And** an activity log entry is recorded with action `'admin.tool_updated'`

**Given** an authenticated admin
**When** they DELETE `/api/admin/tools/{id}`
**Then** the tool is deleted and a success message is returned
**And** an activity log entry is recorded with action `'admin.tool_deleted'`

**Given** a non-admin user attempts any admin tool operation
**When** the request is made
**Then** a 403 response is returned
