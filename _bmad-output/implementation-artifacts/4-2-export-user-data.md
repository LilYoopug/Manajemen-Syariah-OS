# Story 4.2: Export User Data

Status: done

## Story

As a user,
I want to export all my data as a downloadable file,
So that I have a backup of my tasks, history, categories, and profile.

## Acceptance Criteria

1. **Export All User Data**
   - Given an authenticated user
   - When they POST `/api/profile/export`
   - Then a JSON file is returned containing all their data:
     - Profile information (name, email, role, theme, profilePicture, zakatRate, preferredAkad, calculationMethod)
     - All tasks with their history entries
     - All categories
   - And the response has appropriate download headers (Content-Disposition: attachment; filename="user-data-{timestamp}.json")
   - And only the requesting user's data is included (scoped by ownership)
   - And sensitive fields (password, tokens) are never included

2. **Export with Empty Data**
   - Given a user has no tasks
   - When they POST `/api/profile/export`
   - Then the export still succeeds with empty arrays for tasks/history
   - And the response is a valid JSON file

3. **Unauthenticated Access Denied**
   - Given an unauthenticated request
   - When they POST `/api/profile/export`
   - Then a 401 response is returned

## Tasks / Subtasks

- [x] Task 1: Add export route (AC: 1, 2, 3)
  - [x] Add `POST /api/profile/export` route in `routes/api.php`
  - [x] Route protected with `auth:sanctum` middleware

- [x] Task 2: Implement export method in ProfileController (AC: 1, 2)
  - [x] Add `export()` method to ProfileController
  - [x] Gather all user data (profile, tasks with history, categories)
  - [x] Return JSON response with download headers
  - [x] Log activity with action `'user.data_exported'`

- [x] Task 3: Create feature tests (AC: 1-3)
  - [x] Create `tests/Feature/Profile/ProfileExportTest.php`
  - [x] Test export with complete data
  - [x] Test export with empty tasks
  - [x] Test unauthenticated request
  - [x] Test data isolation (only own data exported)

## Dev Notes

### Architecture Compliance

**Pattern:** Thin controllers with inline logic for simple operations. Export is a read-only operation gathering data from existing models.

**Data Scoping:** All queries MUST be scoped via `auth()->user()->relationship()`:
```php
$user = $request->user();
$tasks = $user->tasks()->with('history')->get();
$categories = $user->categories()->get();
```

**Activity Logging:** Use ActivityLogService to record export action.

### Export Data Structure

```json
{
  "exportedAt": "2026-02-12T14:30:00Z",
  "profile": {
    "name": "Ahmad",
    "email": "ahmad@example.com",
    "role": "user",
    "theme": "light",
    "profilePicture": null,
    "zakatRate": 2.5,
    "preferredAkad": "Murabahah",
    "calculationMethod": "Hijri"
  },
  "tasks": [
    {
      "id": 1,
      "text": "Complete daily prayer",
      "completed": true,
      "category": "Kepatuhan",
      "progress": 100,
      "hasLimit": false,
      "currentValue": 0,
      "targetValue": null,
      "unit": null,
      "resetCycle": "daily",
      "history": [
        {
          "id": 1,
          "value": 1,
          "note": null,
          "timestamp": "2026-02-12T08:00:00Z"
        }
      ]
    }
  ],
  "categories": [
    { "id": 1, "name": "SDM" },
    { "id": 2, "name": "Keuangan" }
  ]
}
```

### Response Headers

```php
return response()->json($exportData)
    ->header('Content-Disposition', 'attachment; filename="user-data-' . now()->format('Y-m-d-His') . '.json"')
    ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
```

### File Structure

```
backend/
├── app/
│   └── Http/
│       └── Controllers/Api/
│           └── ProfileController.php   ← MODIFY (add export method)
├── routes/
│   └── api.php                          ← MODIFY (add export route)
└── tests/
    └── Feature/
        └── Profile/
            └── ProfileExportTest.php    ← NEW
```

### Previous Story Learnings (4-1)

1. **Use ActivityLogService** - Inject via constructor and log all user actions
2. **Use DB::transaction** - Even for read operations that log activity
3. **Snake_case to camelCase** - Use field maps for consistent transformation
4. **ProfileResource exists** - Can reuse for profile section of export

### Model Relationships

```
User
├── tasks() -> HasMany(Task)
├── categories() -> HasMany(Category)
└── activityLogs() -> HasMany(ActivityLog)

Task
└── history() -> HasMany(TaskHistory)
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2]
- [Source: _bmad-output/planning-artifacts/architecture.md - Data Flow]
- [Source: backend/app/Models/User.php - User model relationships]
- [Source: backend/app/Http/Resources/ProfileResource.php - Profile transformation]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

### Completion Notes List

- **Task 1 (Routes)**: Added `POST /api/profile/export` route under auth:sanctum middleware
- **Task 2 (ProfileController)**: Added `export()` method that:
  - Gathers all user data scoped via `auth()->user()` relationships
  - Builds export data structure with profile, tasks (including history), and categories
  - Returns JSON with Content-Disposition header for download
  - Logs activity with action `user.data_exported` via ActivityLogService
  - Uses DB::transaction for activity logging
- **Task 3 (Tests)**: Created comprehensive test suite with 9 test cases covering:
  - Export all user data with tasks, history, and categories
  - Export with empty data (no tasks)
  - Unauthenticated access denial
  - Data isolation (only own data exported)
  - Download headers verification
  - Activity log creation
  - Sensitive fields exclusion
  - Task history inclusion

**Note**: PHP runtime not available in current environment. Tests written but not executed. Recommend running `php artisan test tests/Feature/Profile/ProfileExportTest.php` in environment with PHP 8.2+.

### File List

**Created:**
- `backend/tests/Feature/Profile/ProfileExportTest.php`

**Modified:**
- `backend/routes/api.php` - Added export route
- `backend/app/Http/Controllers/Api/ProfileController.php` - Added export() method
