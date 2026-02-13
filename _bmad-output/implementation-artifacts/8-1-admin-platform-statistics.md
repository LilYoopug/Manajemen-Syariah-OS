# Story 8.1: Admin Platform Statistics

Status: review

## Story

As an admin,
I want to view platform-wide statistics,
So that I can monitor the health and usage of the SyariahOS platform.

## Acceptance Criteria

1. **Admin Can View Statistics**
   - Given an authenticated admin user
   - When they GET `/api/admin/stats`
   - Then the response includes computed statistics:
     - Total registered users
     - Total tasks across all users
     - Total completed tasks
     - Active users (users who logged in within last 30 days, from activity_logs)
     - Recent activity summary (last 10 activity log entries)
   - And the response uses appropriate Resource formatting with camelCase keys

2. **Non-Admin Access Denied**
   - Given a non-admin user
   - When they GET `/api/admin/stats`
   - Then a 403 response is returned

3. **Unauthenticated Access Denied**
   - Given an unauthenticated request
   - When they GET `/api/admin/stats`
   - Then a 401 response is returned

## Tasks / Subtasks

- [x] Task 1: Create AdminStatsController (AC: 1-3)
  - [x] Create `app/Http/Controllers/Api/Admin/StatsController.php`
  - [x] Create `index()` method for statistics retrieval
  - [x] Inject User, Task, ActivityLog models

- [x] Task 2: Create AdminStatsResource (AC: 1)
  - [x] Skipped separate resource - stats returned directly with ActivityLogResource for recentActivity

- [x] Task 3: Add admin route (AC: 1-3)
  - [x] Add `GET /api/admin/stats` route
  - [x] Route protected with `auth:sanctum` and `admin` middleware

- [x] Task 4: Create feature tests (AC: 1-3)
  - [x] Create `tests/Feature/Admin/AdminStatsTest.php`
  - [x] Test admin can view statistics
  - [x] Test non-admin receives 403
  - [x] Test unauthenticated receives 401
  - [x] Verify statistics accuracy (users, tasks, completed tasks, active users)

## Dev Notes

### Pre-existing Components (Reuse)

- `AdminMiddleware` - Already exists at `app/Http/Middleware/AdminMiddleware.php`
- `User` model - Has `isAdmin()` method and relationships
- `Task` model - Has `completed` boolean field
- `ActivityLog` model - Has `action`, `user_id`, `created_at` fields
- `ActivityLogResource` - Already exists for formatting log entries
- Routes already have admin middleware group defined in `routes/api.php`

### Statistics Calculation Logic

```php
// Total registered users
$totalUsers = User::count();

// Total tasks across all users
$totalTasks = Task::count();

// Total completed tasks
$completedTasks = Task::where('completed', true)->count();

// Active users (logged in within last 30 days)
$activeUsers = User::whereHas('activityLogs', function ($query) {
    $query->where('action', 'user.login')
          ->where('created_at', '>=', now()->subDays(30));
})->count();

// Recent activity (last 10 entries)
$recentActivity = ActivityLog::with('user')
    ->latest('created_at')
    ->take(10)
    ->get();
```

### AdminStatsResource Format

```php
return [
    'totalUsers' => $this->totalUsers,
    'totalTasks' => $this->totalTasks,
    'completedTasks' => $this->completedTasks,
    'activeUsers' => $this->activeUsers,
    'recentActivity' => ActivityLogResource::collection($this->recentActivity),
];
```

### File Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── Admin/
│   │   │       └── StatsController.php      ← NEW
│   │   └── Resources/
│   │       ├── ActivityLogResource.php      ← EXISTS
│   │       └── AdminStatsResource.php       ← NEW
├── routes/
│   └── api.php                               ← MODIFY (add admin route)
└── tests/
    └── Feature/
        └── Admin/
            └── AdminStatsTest.php            ← NEW
```

### Previous Story Learnings (Epic 7)

1. **Resource pattern** - Use API Resources for consistent response formatting
2. **Test pattern** - Use `$this->actingAs($user)` for authenticated requests
3. **Admin testing** - Create user with role 'admin' for admin tests, 'user' for non-admin
4. **Error responses** - Return 403 for forbidden, 401 for unauthenticated

### Route Configuration

The admin routes already have a middleware group in `routes/api.php`:

```php
Route::middleware('admin')->prefix('admin')->group(function () {
    // Admin stats, logs, users, tools management
});
```

Add the stats route inside this group:

```php
Route::middleware('admin')->prefix('admin')->group(function () {
    Route::get('/stats', [\App\Http\Controllers\Api\Admin\StatsController::class, 'index']);
});
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Admin Routes]
- [Source: backend/app/Http/Middleware/AdminMiddleware.php]
- [Source: backend/app/Models/User.php]
- [Source: backend/app/Models/Task.php]
- [Source: backend/app/Models/ActivityLog.php]

## Dev Agent Record

### Agent Model Used

glm-5

### Debug Log References

N/A - PHP runtime not available in development environment. Tests written but not executed.

### Completion Notes List

- AdminStatsController created at `app/Http/Controllers/Api/Admin/StatsController.php`
- Statistics computed: totalUsers, totalTasks, completedTasks, activeUsers (30-day login window), recentActivity (last 10)
- ActivityLogResource reused for recentActivity formatting (no separate AdminStatsResource needed)
- Route added under admin middleware group
- Comprehensive feature tests created covering all ACs

### File List

**Created:**
- `backend/app/Http/Controllers/Api/Admin/StatsController.php`
- `backend/tests/Feature/Admin/AdminStatsTest.php`

**Modified:**
- `backend/routes/api.php`
