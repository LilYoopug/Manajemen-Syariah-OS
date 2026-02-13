# Story 8.4: Admin User Export

Status: done

## Story

As an admin,
I want to export user data,
So that I can generate reports or backups of the platform's user base.

## Acceptance Criteria

1. **Admin Can Export Users**
   - Given an authenticated admin
   - When they GET `/api/admin/users/export`
   - Then a JSON file is returned containing all users with their profile data (excluding passwords and tokens)
   - And the response has appropriate download headers (Content-Disposition)

2. **Non-Admin Access Denied**
   - Given a non-admin user
   - When they GET `/api/admin/users/export`
   - Then a 403 response is returned

## Tasks / Subtasks

- [x] Task 1: Add export method to UserController (AC: 1-2)
  - [x] Add `export()` method to UserController
  - [x] Return JSON file with download headers

- [x] Task 2: Add export route (AC: 1-2)
  - [x] Add `GET /api/admin/users/export` route

- [x] Task 3: Create feature tests (AC: 1-2)
  - [x] Test admin can export users
  - [x] Test export excludes passwords
  - [x] Test non-admin denied

## Dev Notes

### Export Implementation

```php
public function export(): StreamedResponse
{
    $users = User::select(['id', 'name', 'email', 'role', 'theme', 'zakat_rate', 'preferred_akad', 'calculation_method', 'created_at', 'updated_at'])
        ->get();

    $filename = 'users_export_' . now()->format('Y_m_d_His') . '.json';

    return response()->streamDownload(function () use ($users) {
        echo json_encode($users, JSON_PRETTY_PRINT);
    }, $filename, [
        'Content-Type' => 'application/json',
    ]);
}
```

### File Structure

```
backend/
├── app/Http/Controllers/Api/Admin/
│   └── UserController.php        ← MODIFY (add export method)
├── routes/
│   └── api.php                   ← MODIFY (add route)
└── tests/Feature/Admin/
    └── UserExportTest.php        ← NEW
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.4]

## Dev Agent Record

### Agent Model Used

glm-5

### Debug Log References

N/A - PHP runtime not available in development environment. Tests written but not executed.

### Completion Notes List

- Export method added to UserController with StreamedResponse
- JSON file returned with download headers (Content-Disposition)
- Passwords excluded from export (only safe fields selected)
- Feature tests created (6 test cases)

### File List

**Created:**
- `backend/tests/Feature/Admin/UserExportTest.php`

**Modified:**
- `backend/app/Http/Controllers/Api/Admin/UserController.php`
- `backend/routes/api.php`
