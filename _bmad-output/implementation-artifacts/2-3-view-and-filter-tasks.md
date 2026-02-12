# Story 2.3: View and Filter Tasks

Status: done

## Story

As a user,
I want to view my tasks with filtering by category and text search,
So that I can quickly find and manage specific tasks.

## Acceptance Criteria

1. **Get All User Tasks**
   - Given an authenticated user has tasks
   - When they GET `/api/tasks`
   - Then only their own tasks are returned (scoped by `auth()->user()->tasks()`)
   - And the response uses TaskResource collection with camelCase keys

2. **Filter by Category**
   - Given a user wants to filter by category
   - When they GET `/api/tasks?category=Keuangan`
   - Then only tasks matching that category are returned

3. **Search by Text**
   - Given a user wants to search by text
   - When they GET `/api/tasks?search=zakat`
   - Then only tasks whose text contains the search term are returned

4. **Filter by Reset Cycle**
   - Given a user wants to filter by reset cycle
   - When they GET `/api/tasks?cycle=daily`
   - Then only tasks with that reset cycle are returned

5. **Combined Filters**
   - Given multiple filters are combined
   - When they GET `/api/tasks?category=Keuangan&search=zakat`
   - Then results match ALL applied filters

## Tasks / Subtasks

- [x] Task 1: Add index method to TaskController (AC: 1, 2, 3, 4, 5)
  - [x] Add `index()` method to existing `app/Http/Controllers/Api/TaskController.php`
  - [x] Scope tasks to authenticated user
  - [x] Apply optional filters: category, search, cycle
  - [x] Return TaskResource collection

- [x] Task 2: Add task index route in api.php (AC: 1)
  - [x] Add `GET /api/tasks` route in the protected routes group
  - [x] Route must be protected with `auth:sanctum` middleware

- [x] Task 3: Create feature tests (AC: 1-5)
  - [x] Create `tests/Feature/Task/TaskIndexTest.php`
  - [x] Test authenticated user gets their tasks only
  - [x] Test category filter
  - [x] Test text search filter
  - [x] Test reset cycle filter
  - [x] Test combined filters
  - [x] Test unauthenticated request returns 401

## Dev Notes

### Architecture Patterns

- **User Scoping:** Always scope queries to authenticated user via `request()->user()->tasks()`
- **Query Building:** Use conditional query building with `when()` for optional filters
- **Response Format:** Use API Resources for all JSON responses

### Response Format

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "text": "Bayar Zakat Mal",
      "completed": false,
      "category": "Keuangan",
      "progress": 0,
      "hasLimit": true,
      "currentValue": 0,
      "targetValue": 10000000,
      "unit": "IDR",
      "resetCycle": "monthly",
      "perCheckEnabled": false,
      "incrementValue": 1000000,
      "lastResetAt": null,
      "createdAt": "2026-02-12T10:00:00Z",
      "updatedAt": "2026-02-12T10:00:00Z"
    }
  ]
}
```

### Query Filters

| Filter | Query Param | Description |
|--------|-------------|-------------|
| category | `?category=Keuangan` | Filter by exact category match |
| search | `?search=zakat` | Search in task text (case-insensitive LIKE) |
| cycle | `?cycle=daily` | Filter by reset cycle |

### Previous Story Intelligence (Story 2.2)

From the completed Create Tasks story:

1. **TaskController Exists:** Already has `store()` method - add `index()` method
2. **TaskResource Exists:** Already transforms snake_case to camelCase
3. **TaskFactory Available:** Use for test task creation with various states
4. **Route Structure:** Add to existing task routes in `routes/api.php`

### File Structure Requirements

```
backend/
├── app/
│   └── Http/
│       └── Controllers/
│           └── Api/
│               └── TaskController.php           ← MODIFY (add index)
├── routes/
│   └── api.php                                  ← MODIFY
└── tests/
    └── Feature/
        └── Task/
            └── TaskIndexTest.php                ← NEW
```

### Key Files to Create/Modify

1. **MODIFY** `backend/app/Http/Controllers/Api/TaskController.php` - Add index method
2. **MODIFY** `backend/routes/api.php` - Add task index route
3. **NEW** `backend/tests/Feature/Task/TaskIndexTest.php` - Feature tests

### Testing Standards

- Feature tests in `tests/Feature/Task/`
- Test each filter independently
- Test combined filters
- Test user scoping (users can't see other users' tasks)
- Test unauthenticated request handling

### Security Considerations

- Tasks are user-scoped - users can only see their own tasks
- No admin override needed - tasks are personal to each user

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3]
- [Source: backend/app/Models/Task.php - Task model]
- [Source: backend/app/Http/Resources/TaskResource.php - Response transformation]
- [Source: backend/app/Http/Controllers/Api/TaskController.php - Existing controller]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. Added index() method to TaskController with conditional query filters using `when()`
2. Added GET /api/tasks route under auth:sanctum middleware
3. Created comprehensive feature tests covering:
   - Authenticated user gets their tasks only
   - Filter by category
   - Search by text (case-insensitive)
   - Filter by reset cycle
   - Combined filters
   - User cannot see other user's tasks
   - Unauthenticated request returns 401
   - Empty response when no tasks
   - Search is case insensitive
   - Tasks ordered by created_at descending

### File List

**New Files:**
- backend/tests/Feature/Task/TaskIndexTest.php

**Modified Files:**
- backend/app/Http/Controllers/Api/TaskController.php
- backend/routes/api.php
