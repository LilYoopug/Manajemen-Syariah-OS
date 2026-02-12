# Story 4.1: View and Update Profile

Status: done

## Story

As a user,
I want to view and update my profile, shariah preferences, and theme,
So that the platform reflects my personal settings and Islamic finance preferences.

## Acceptance Criteria

1. **View Profile**
   - Given an authenticated user
   - When they GET `/api/profile`
   - Then the response returns their profile data via ProfileResource: name, email, role, theme, profilePicture, zakatRate, preferredAkad, calculationMethod
   - And sensitive fields (password, tokens) are never included

2. **Update Profile**
   - Given an authenticated user
   - When they PUT `/api/profile` with updated fields (name, profilePicture, theme, zakatRate, preferredAkad, calculationMethod)
   - Then only the provided fields are updated on their User model
   - And the response returns the updated profile via ProfileResource
   - And validation is applied via UpdateProfileRequest
   - And email and role cannot be changed through this endpoint

3. **Validation Errors**
   - Given a user provides invalid data (invalid theme value, negative zakatRate)
   - When they PUT `/api/profile`
   - Then a 422 response is returned with field-level validation errors

## Tasks / Subtasks

- [x] Task 1: Create UpdateProfileRequest Form Request (AC: 2, 3)
  - [x] Create `app/Http/Requests/Profile/UpdateProfileRequest.php`
  - [x] Define validation rules for updatable fields
  - [x] Configure error messages

- [x] Task 2: Create ProfileController (AC: 1, 2)
  - [x] Create `app/Http/Controllers/Api/ProfileController.php`
  - [x] Implement show() method for viewing profile
  - [x] Implement update() method for updating profile

- [x] Task 3: Create ProfileResource (AC: 1)
  - [x] Create `app/Http/Resources/ProfileResource.php`
  - [x] Transform user data to camelCase

- [x] Task 4: Add profile routes (AC: 1, 2)
  - [x] Add `GET /api/profile` route
  - [x] Add `PUT /api/profile` route
  - [x] Routes protected with `auth:sanctum` middleware

- [x] Task 5: Create feature tests (AC: 1-3)
  - [x] Create `tests/Feature/Profile/ProfileTest.php`
  - [x] Test view profile
  - [x] Test update profile
  - [x] Test validation errors
  - [x] Test unauthenticated request

## Dev Notes

### User Model Fields

| Field | Type | Updatable | Description |
|-------|------|-----------|-------------|
| name | string | Yes | User's display name |
| email | string | No | User's email (cannot change) |
| role | string | No | User's role (cannot change) |
| theme | string | Yes | 'light' or 'dark' |
| profile_picture | string | Yes | URL to profile picture |
| zakat_rate | decimal | Yes | Custom zakat rate |
| preferred_akad | string | Yes | Preferred Islamic contract type |
| calculation_method | string | Yes | 'Hijri' or 'Masehi' |

### Response Format

**GET /api/profile:**
```json
{
  "data": {
    "id": 1,
    "name": "Ahmad",
    "email": "ahmad@example.com",
    "role": "user",
    "theme": "light",
    "profilePicture": null,
    "zakatRate": 2.5,
    "preferredAkad": "Murabahah",
    "calculationMethod": "Hijri"
  }
}
```

### File Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── ProfileController.php   ← NEW
│   │   ├── Requests/Profile/
│   │   │   └── UpdateProfileRequest.php ← NEW
│   │   └── Resources/
│   │       └── ProfileResource.php      ← NEW
├── routes/
│   └── api.php                          ← MODIFY
└── tests/
    └── Feature/
        └── Profile/
            └── ProfileTest.php          ← NEW
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1]
- [Source: backend/app/Models/User.php - User model]
- [Source: frontend/src/types/index.ts - UserProfile interface]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Completion Notes List

- **Task 1 (UpdateProfileRequest)**: Created with validation rules for name, profilePicture, theme, zakatRate, preferredAkad, calculationMethod with appropriate constraints. Added URL validation for profilePicture.
- **Task 2 (ProfileController)**: Created with show() and update() methods. Uses array_key_exists() to properly handle null values (isset() bug fixed). Added ActivityLogService injection and transaction wrapper. Maps camelCase to snake_case via field map.
- **Task 3 (ProfileResource)**: Pre-existing from project initialization - transforms user model to camelCase JSON response
- **Task 4 (Routes)**: Added GET/PUT /api/profile routes under auth:sanctum middleware
- **Task 5 (Tests)**: Created comprehensive test suite with 19 test cases covering:
  - View profile success
  - Profile excludes sensitive fields
  - Update profile success
  - Partial update
  - Validation errors (invalid theme, negative zakatRate, zakatRate > 100, invalid calculationMethod, invalid profilePicture URL)
  - Unauthenticated access denial
  - Email/role immutability
  - Profile picture update
  - Nullable field handling
  - Empty request body handling
  - Activity log verification

**Code Review Fixes Applied:**
- Fixed isset() bug - now uses array_key_exists() for null value handling
- Added ActivityLogService for audit trail
- Added DB::transaction wrapper for consistency
- Refactored field mapping to use $fieldMap array (DRY)
- Added URL validation for profilePicture field
- Added missing test cases

**Note**: PHP runtime not available in current environment. Tests written but not executed. Recommend running `php artisan test tests/Feature/Profile/ProfileTest.php` in environment with PHP 8.2+.

### File List

**Created:**
- `backend/app/Http/Controllers/Api/ProfileController.php`
- `backend/app/Http/Requests/Profile/UpdateProfileRequest.php`
- `backend/tests/Feature/Profile/ProfileTest.php`

**Modified:**
- `backend/routes/api.php` - Added profile routes

**Pre-existing (verified in git):**
- `backend/app/Http/Resources/ProfileResource.php`
