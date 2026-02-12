# Story 1.5: Admin Route Protection Middleware

Status: done

## Story

As the system,
I want to enforce admin-only access on restricted routes,
So that regular users cannot access platform administration features.

## Acceptance Criteria

1. **Admin Access Granted**
   - Given an `AdminMiddleware` exists at `app/Http/Middleware/AdminMiddleware.php`
   - When a request hits an admin-protected route with a user whose role is `'admin'`
   - Then the request proceeds normally to the controller

2. **Regular User Forbidden**
   - Given an authenticated user with role `'user'`
   - When they attempt to access any route under `/api/admin/*`
   - Then a 403 response is returned with message "Unauthorized"

3. **Unauthenticated Request**
   - Given an unauthenticated request (no token or invalid token)
   - When it hits an admin-protected route
   - Then a 401 response is returned with message "Unauthenticated."

4. **Middleware Registered**
   - The middleware is registered and applied to the `api/admin` route group in `routes/api.php`

## Tasks / Subtasks

- [x] Task 1: Create AdminMiddleware (AC: 1, 2)
  - [x] Create `app/Http/Middleware/AdminMiddleware.php`
  - [x] Check if user is authenticated (should already be via auth:sanctum)
  - [x] Check if user role is 'admin'
  - [x] Return 403 "Unauthorized" if not admin
  - [x] Allow request to proceed if admin

- [x] Task 2: Register middleware alias (AC: 4)
  - [x] Register 'admin' middleware alias in `bootstrap/app.php`
  - [x] Middleware should be registered with alias 'admin'

- [x] Task 3: Verify route group already uses middleware (AC: 4)
  - [x] Verify `routes/api.php` already has admin middleware on `/api/admin/*` routes
  - [x] No changes needed if already configured

- [x] Task 4: Create feature test for admin middleware (AC: 1, 2, 3)
  - [x] Create `tests/Feature/Middleware/AdminMiddlewareTest.php`
  - [x] Test admin user can access protected routes
  - [x] Test regular user gets 403 Forbidden
  - [x] Test unauthenticated request gets 401 Unauthorized

## Dev Notes

### Architecture Patterns

- **Middleware Chain:** `auth:sanctum` runs first, then `admin` middleware
- **Role Check:** Access user role via `$request->user()->isAdmin()` method
- **Response Format:** Return JSON response with appropriate status code

### Response Format

**Unauthorized Response (403 Forbidden):**
```json
{
  "message": "Unauthorized"
}
```

**Unauthenticated Response (401 Unauthorized):**
```json
{
  "message": "Unauthenticated."
}
```

### Previous Story Intelligence (Story 1.4)

From the completed User Logout story:

1. **Routes Structure:** Admin route group already exists with `admin` middleware placeholder
2. **UserFactory Available:** Can create both admin and regular user for testing
3. **Sanctum Authenticated:** Use `Sanctum::actingAs()` for test authentication

### Laravel 12 Middleware Registration

In Laravel 12, middleware is registered in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ]);
})
```

### File Structure Requirements

```
backend/
├── app/
│   └── Http/
│       └── Middleware/
│           └── AdminMiddleware.php             ← NEW
├── bootstrap/
│   └── app.php                                 ← MODIFY (register middleware)
└── tests/
    └── Feature/
        └── Middleware/
            └── AdminMiddlewareTest.php         ← NEW
```

### Key Files to Create/Modify

1. **NEW** `backend/app/Http/Middleware/AdminMiddleware.php` - Admin middleware
2. **MODIFY** `backend/bootstrap/app.php` - Register middleware alias
3. **NEW** `backend/tests/Feature/Middleware/AdminMiddlewareTest.php` - Feature tests

### Testing Standards

- Feature tests in `tests/Feature/Middleware/`
- Test all three scenarios: admin access, regular user forbidden, unauthenticated
- Use `Sanctum::actingAs()` for authenticated tests
- Create users with admin role using factory state

### Security Considerations

- Admin middleware must run AFTER auth:sanctum (middleware order matters)
- Role check is case-sensitive ('admin' vs 'Admin')
- All admin routes should be under `/api/admin/*` prefix

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: backend/routes/api.php - Existing admin route group]
- [Source: Laravel 12 Middleware Documentation]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6-20250528)

### Debug Log References

N/A - Implementation completed without blocking issues.

### Completion Notes List

1. Updated AdminMiddleware to properly handle unauthenticated (401) vs unauthorized (403) cases
2. Middleware was already registered in bootstrap/app.php
3. Route group already configured with admin middleware in routes/api.php
4. User model already has isAdmin() method
5. UserFactory already has admin() state method
6. Created comprehensive feature tests covering:
   - Admin user can access protected routes (returns 404 since routes don't exist yet)
   - Regular user gets 403 Forbidden with "Unauthorized" message
   - Unauthenticated request gets 401 Unauthorized with "Unauthenticated." message
   - Invalid token gets 401
   - isAdmin() method works correctly

### File List

**New Files:**
- backend/tests/Feature/Middleware/AdminMiddlewareTest.php

**Modified Files:**
- backend/app/Http/Middleware/AdminMiddleware.php
