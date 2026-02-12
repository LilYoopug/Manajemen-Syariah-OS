# Story 1.2: User Registration

Status: done

## Story

As a visitor,
I want to register with my name, email, and password,
So that I can create an account and start using the platform.

## Acceptance Criteria

1. **Successful Registration**
   - Given a visitor is not authenticated
   - When they POST to `/api/auth/register` with valid name, email, and password
   - Then a new User is created with role defaulting to `'user'`
   - And a Sanctum bearer token is returned in the response body
   - And the response includes the user profile data (id, name, email, role)
   - And the password is hashed with bcrypt (never stored in plain text)
   - And an activity log entry is recorded with action `'user.registered'`

2. **Duplicate Email Validation**
   - Given a visitor provides an already-used email
   - When they POST to `/api/auth/register`
   - Then a 422 response is returned with field-level error on `email`

3. **Input Validation Errors**
   - Given a visitor provides invalid input (missing name, password < 8 chars, invalid email format)
   - When they POST to `/api/auth/register`
   - Then a 422 response is returned with specific field-level validation errors via RegisterRequest

## Tasks / Subtasks

- [x] Task 1: Create RegisterRequest Form Request (AC: 2, 3)
  - [x] Create `app/Http/Requests/Auth/RegisterRequest.php`
  - [x] Define validation rules: name (required, string, max:255), email (required, email, unique:users), password (required, string, min:8, confirmed)
  - [x] Configure error messages for each field

- [x] Task 2: Create AuthController with register method (AC: 1, 2, 3)
  - [x] Create `app/Http/Controllers/Api/AuthController.php`
  - [x] Implement `register()` method using RegisterRequest
  - [x] Create user with validated data
  - [x] Hash password via Laravel's built-in casting (already configured in User model)
  - [x] Create Sanctum token using `createToken()`
  - [x] Log activity via ActivityLogService with action `'user.registered'`
  - [x] Return response with token and UserResource

- [x] Task 3: Register route in api.php (AC: 1)
  - [x] Add `POST /api/auth/register` route in the auth prefix group
  - [x] Route should be publicly accessible (no auth middleware)

- [x] Task 4: Create feature test for registration (AC: 1, 2, 3)
  - [x] Create `tests/Feature/Auth/RegisterTest.php`
  - [x] Test successful registration returns token and user data
  - [x] Test duplicate email returns 422 with error
  - [x] Test validation errors for invalid inputs
  - [x] Test activity log is created

## Dev Notes

### Architecture Patterns

- **Validation:** Use Laravel Form Requests (`RegisterRequest`) for all input validation - NEVER validate in controller
- **Response Format:** Use API Resources (`UserResource`) for all JSON responses - NEVER return raw Eloquent models
- **Password Hashing:** Laravel's `password` cast handles bcrypt hashing automatically (already configured in User model)
- **Token Generation:** Use `$user->createToken('auth-token')->plainTextToken` for Sanctum tokens
- **Activity Logging:** Use `ActivityLogService::logAuth('user.registered', $user->id)` for registration logging

### Response Format

**Success Response (201 Created):**
```json
{
  "message": "Registration successful",
  "token": "1|abc123...",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "theme": "light",
    "profilePicture": null,
    "zakatRate": null,
    "preferredAkad": null,
    "calculationMethod": null,
    "createdAt": "2026-02-12T10:00:00Z",
    "updatedAt": "2026-02-12T10:00:00Z"
  }
}
```

**Validation Error Response (422):**
```json
{
  "message": "The email has already been taken.",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

### Previous Story Intelligence (Story 1.1)

From the completed Laravel initialization story:

1. **User Model Ready:** The User model already has all required fields (name, email, password, role, theme, profile_picture, zakat_rate, preferred_akad, calculation_method) with default values for role='user' and theme='light'

2. **UserResource Created:** `app/Http/Resources/UserResource.php` transforms snake_case to camelCase for JSON responses

3. **ActivityLogService Available:** Use `logAuth()` method for authentication-related activity logging

4. **Sanctum Configured:** Bearer token authentication is configured via `bootstrap/app.php` middleware

5. **Routes Structure:** Auth routes should go under `Route::prefix('auth')->group()` in `routes/api.php`

### File Structure Requirements

```
backend/
├── app/
│   └── Http/
│       ├── Controllers/
│       │   └── Api/
│       │       └── AuthController.php         ← NEW
│       └── Requests/
│           └── Auth/
│               └── RegisterRequest.php        ← NEW
└── tests/
    └── Feature/
        └── Auth/
            └── RegisterTest.php               ← NEW
```

### Key Files to Create/Modify

1. **NEW** `backend/app/Http/Controllers/Api/AuthController.php` - Auth controller with register method
2. **NEW** `backend/app/Http/Requests/Auth/RegisterRequest.php` - Registration validation
3. **MODIFY** `backend/routes/api.php` - Add register route
4. **NEW** `backend/tests/Feature/Auth/RegisterTest.php` - Feature tests

### Testing Standards

- Feature tests in `tests/Feature/Auth/`
- Test both success and error scenarios
- Test validation rules specifically
- Verify activity log is created on registration
- Test response format matches UserResource structure

### Security Considerations

- Password is automatically hashed by Laravel's cast (bcrypt)
- Never return password in response (UserResource already excludes it)
- Token is returned only once at registration
- Default role is 'user' - admin promotion requires admin action (Story 8.3)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR1, FR4]
- [Source: backend/app/Models/User.php - User model with defaults]
- [Source: backend/app/Services/ActivityLogService.php - Activity logging]
- [Source: backend/app/Http/Resources/UserResource.php - Response transformation]
- [Source: frontend/src/types/index.ts - TypeScript User interface]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. Created RegisterRequest Form Request with validation rules for name, email, and password
2. Created AuthController with register() method using dependency injection for ActivityLogService
3. Register route added to auth prefix group (publicly accessible)
4. Created comprehensive feature tests covering:
   - Successful registration with token and user data verification
   - Activity log creation on registration
   - Duplicate email validation (422 error)
   - Missing name validation
   - Invalid email format validation
   - Password minimum length validation
   - Password confirmation mismatch validation
   - Default role assignment verification
   - Default theme assignment verification
5. Created UserFactory for test data generation (was missing)
6. All code follows Laravel 12 patterns and architecture standards from Dev Notes

### Code Review Fixes Applied

1. **HIGH** Removed unused `Hash` import from AuthController
2. **HIGH** Added database transaction wrapping user creation and activity logging for atomicity
3. **MEDIUM** Removed unused `Password` rule import from RegisterRequest
4. **MEDIUM** Extracted token name to class constant `TOKEN_NAME`
5. **LOW** Created missing base `Controller` class

### File List

**New Files:**
- backend/app/Http/Controllers/Controller.php
- backend/app/Http/Controllers/Api/AuthController.php
- backend/app/Http/Requests/Auth/RegisterRequest.php
- backend/tests/Feature/Auth/RegisterTest.php
- backend/database/factories/UserFactory.php

**Modified Files:**
- backend/routes/api.php
