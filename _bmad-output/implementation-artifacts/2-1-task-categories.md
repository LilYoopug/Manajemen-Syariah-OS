# Story 2.1: Task Categories

Status: review

## Story

As a user,
I want to view my task categories,
So that I can organize tasks into meaningful groups.

## Acceptance Criteria

1. **Default Categories Seeded**
   - Given the categories migration creates a `categories` table with columns: id, user_id (foreign), name (string)
   - When a new user is created
   - Then default categories are seeded for that user via model observer (SDM, Keuangan, Kepatuhan, Pemasaran, Operasional, Teknologi)

2. **Get User Categories**
   - Given an authenticated user
   - When they GET `/api/categories`
   - Then only their own categories are returned (scoped by `auth()->user()->categories()`)
   - And the response uses CategoryResource with camelCase keys
   - And the response format is `{ "data": [...] }`

3. **Unauthenticated Request**
   - Given an unauthenticated request
   - When they GET `/api/categories`
   - Then a 401 response is returned

## Tasks / Subtasks

- [x] Task 1: Create CategoryResource (AC: 2)
  - [x] Create `app/Http/Resources/CategoryResource.php`
  - [x] Transform snake_case to camelCase (id, name, createdAt, updatedAt)
  - [x] Return array with proper key transformation

- [x] Task 2: Create CategoryController (AC: 2)
  - [x] Create `app/Http/Controllers/Api/CategoryController.php`
  - [x] Implement `index()` method returning user's categories via `auth()->user()->categories()`
  - [x] Use CategoryResource collection for response

- [x] Task 3: Add categories route (AC: 2, 3)
  - [x] Add `GET /api/categories` route in `routes/api.php`
  - [x] Route must be protected with `auth:sanctum` middleware

- [x] Task 4: Create user observer for default categories (AC: 1)
  - [x] Create `app/Observers/UserObserver.php`
  - [x] Implement `created()` method to seed default categories
  - [x] Register observer in User model via `#[ObservedBy]` attribute
  - [x] Default categories: SDM, Keuangan, Kepatuhan, Pemasaran, Operasional, Teknologi

- [x] Task 5: Create feature tests (AC: 1, 2, 3)
  - [x] Create `tests/Feature/Category/CategoryIndexTest.php`
  - [x] Test authenticated user gets their categories
  - [x] Test unauthenticated request returns 401
  - [x] Test new user gets default categories seeded

## Dev Notes

### Architecture Patterns

- **User Scoping:** Always scope queries to authenticated user via `request()->user()->categories()`
- **Response Format:** Use API Resources for all JSON responses - NEVER return raw Eloquent models
- **Model Observers:** Use Laravel Observers for side effects on model creation

### Response Format

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "SDM",
      "createdAt": "2026-02-12T10:00:00Z",
      "updatedAt": "2026-02-12T10:00:00Z"
    }
  ]
}
```

**Unauthenticated Response (401 Unauthorized):**
```json
{
  "message": "Unauthenticated."
}
```

### Default Categories

The following categories are seeded for every new user:

1. **SDM** - Human Resources
2. **Keuangan** - Finance
3. **Kepatuhan** - Compliance
4. **Pemasaran** - Marketing
5. **Operasional** - Operations
6. **Teknologi** - Technology

### Previous Story Intelligence (Story 1.5)

From the completed Admin Middleware story:

1. **User Model Has Categories Relation:** `User::categories()` already defined
2. **Category Model Exists:** `app/Models/Category.php` with user relation
3. **Categories Migration Exists:** Table already created with id, user_id, name, timestamps
4. **UserFactory Available:** Use for test user creation
5. **Auth Middleware Pattern:** Use `auth:sanctum` for protected routes

### Model Observer Pattern

In Laravel 12, register observers via the `#[ObservedBy]` attribute on the model.

### File Structure Requirements

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── CategoryController.php      ← NEW
│   │   └── Resources/
│   │       └── CategoryResource.php            ← MODIFIED
│   └── Observers/
│       └── UserObserver.php                    ← NEW
├── routes/
│   └── api.php                                 ← MODIFIED
└── tests/
    └── Feature/
        └── Category/
            └── CategoryIndexTest.php           ← NEW
```

### Key Files to Create/Modify

1. **MODIFIED** `backend/app/Http/Resources/CategoryResource.php` - Added updatedAt
2. **NEW** `backend/app/Http/Controllers/Api/CategoryController.php` - Controller
3. **MODIFIED** `backend/routes/api.php` - Add categories route
4. **NEW** `backend/app/Observers/UserObserver.php` - Seed default categories
5. **MODIFIED** `backend/app/Models/User.php` - Add observer attribute
6. **NEW** `backend/tests/Feature/Category/CategoryIndexTest.php` - Feature tests

### Testing Standards

- Feature tests in `tests/Feature/Category/`
- Test authenticated user gets only their categories
- Test new user has default categories after registration
- Test unauthenticated request handling
- Test response format matches CategoryResource structure

### Security Considerations

- Categories are user-scoped - users can only see their own categories
- No admin override needed - categories are personal to each user
- No create/update/delete endpoints needed (categories are pre-seeded)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data ownership]
- [Source: backend/app/Models/Category.php - Category model]
- [Source: backend/app/Models/User.php - User with categories relation]
- [Source: backend/database/migrations/2026_02_12_000002_create_categories_table.php]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. CategoryResource already existed - added updatedAt field
2. Created CategoryController with index() method
3. Added GET /api/categories route under auth:sanctum middleware
4. Created UserObserver to seed 6 default categories on user creation
5. Registered observer via #[ObservedBy] attribute on User model
6. Created comprehensive feature tests covering:
   - Authenticated user gets their categories
   - User only sees their own categories (not other users')
   - Unauthenticated request returns 401
   - New user gets default categories seeded
   - Categories count matches expected (6)
   - Category resource format uses camelCase

### File List

**New Files:**
- backend/app/Http/Controllers/Api/CategoryController.php
- backend/app/Observers/UserObserver.php
- backend/tests/Feature/Category/CategoryIndexTest.php

**Modified Files:**
- backend/app/Http/Resources/CategoryResource.php
- backend/app/Models/User.php
- backend/routes/api.php
