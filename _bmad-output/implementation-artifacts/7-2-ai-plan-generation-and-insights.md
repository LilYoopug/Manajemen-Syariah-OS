# Story 7.2: AI Plan Generation and Insights

Status: done

## Story

As a user,
I want to generate strategic plans and receive AI-powered insights based on my performance data,
So that I can make data-driven decisions for my Islamic business compliance strategy.

## Acceptance Criteria

1. **Generate Plan**
   - Given an authenticated user
   - When they POST `/api/ai/generate-plan` with goals/context data
   - Then the request is proxied to Gemini API with the plan generation prompt
   - And the AI-generated plan is returned to the user

2. **Generate Insights**
   - Given an authenticated user
   - When they POST `/api/ai/insight` with KPI/goal data
   - Then the request is proxied to Gemini API with the insight generation prompt
   - And AI-generated insights are returned to the user

3. **Validation Errors**
   - Given either endpoint receives invalid or missing input
   - When the POST is made
   - Then a 422 response is returned with validation errors

4. **Graceful Error Handling**
   - Given the Gemini API is unreachable or returns an error
   - When a user sends a request to either endpoint
   - Then a graceful 503 error response is returned
   - And the error message indicates the AI service is temporarily unavailable

5. **Unauthenticated Access Denied**
   - Given an unauthenticated request
   - When they POST to any AI endpoint
   - Then a 401 response is returned

6. **Service Reuse**
   - Given AiProxyService already exists from Story 7-1
   - When implementing plan and insight endpoints
   - Then the service is extended with new methods (no duplication)

## Tasks / Subtasks

- [x] Task 1: Extend AiProxyService (AC: 1, 2, 6)
  - [x] Add `generatePlan(array $goals): array` method
  - [x] Add `insight(array $kpiData): array` method
  - [x] Reuse existing HTTP client configuration

- [x] Task 2: Create GeneratePlanRequest validation (AC: 3)
  - [x] Create `app/Http/Requests/Ai/GeneratePlanRequest.php`
  - [x] Validate goals array is required
  - [x] Validate optional context field

- [x] Task 3: Create InsightRequest validation (AC: 3)
  - [x] Create `app/Http/Requests/Ai/InsightRequest.php`
  - [x] Validate kpiData array is required

- [x] Task 4: Extend AiController (AC: 1-5)
  - [x] Add `generatePlan(GeneratePlanRequest $request)` method
  - [x] Add `insight(InsightRequest $request)` method
  - [x] Reuse AiProxyService injection

- [x] Task 5: Add AI routes (AC: 1-5)
  - [x] Add `POST /api/ai/generate-plan` route
  - [x] Add `POST /api/ai/insight` route
  - [x] Routes protected with `auth:sanctum` middleware

- [x] Task 6: Create feature tests (AC: 1-5)
  - [x] Create `tests/Feature/Ai/AiPlanAndInsightTest.php`
  - [x] Test generate plan (mock Gemini response)
  - [x] Test generate insight (mock Gemini response)
  - [x] Test validation errors
  - [x] Test graceful error handling
  - [x] Test unauthenticated requests

## Dev Notes

### Pre-existing Components (Reuse from Story 7-1)

- `AiProxyService` - Already has `chat()` method, HTTP client config, error handling
- `AiController` - Already exists with service injection
- `config/services.php` - Gemini config already set up
- Routes protected with `auth:sanctum`

### Extending AiProxyService

Add two new methods to the existing service:

```php
/**
 * Generate a strategic plan based on user goals.
 *
 * @param array $goals
 * @return array
 * @throws \Exception
 */
public function generatePlan(array $goals): array
{
    if (empty($this->apiKey)) {
        throw new \Exception('AI service is not configured');
    }

    $prompt = $this->buildPlanPrompt($goals);

    try {
        $response = Http::timeout($this->timeout)
            ->post("{$this->apiUrl}/gemini-pro:generateContent?key={$this->apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
            ]);

        if (!$response->successful()) {
            Log::error('Gemini API error', ['status' => $response->status()]);
            throw new \Exception('AI service returned an error');
        }

        $data = $response->json();
        return [
            'plan' => $data['candidates'][0]['content']['parts'][0]['text'] ?? '',
        ];
    } catch (ConnectionException $e) {
        Log::error('Gemini API connection error', ['message' => $e->getMessage()]);
        throw new \Exception('AI service is temporarily unavailable');
    }
}

/**
 * Generate insights based on KPI data.
 *
 * @param array $kpiData
 * @return array
 * @throws \Exception
 */
public function insight(array $kpiData): array
{
    if (empty($this->apiKey)) {
        throw new \Exception('AI service is not configured');
    }

    $prompt = $this->buildInsightPrompt($kpiData);

    try {
        $response = Http::timeout($this->timeout)
            ->post("{$this->apiUrl}/gemini-pro:generateContent?key={$this->apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
            ]);

        if (!$response->successful()) {
            Log::error('Gemini API error', ['status' => $response->status()]);
            throw new \Exception('AI service returned an error');
        }

        $data = $response->json();
        return [
            'insight' => $data['candidates'][0]['content']['parts'][0]['text'] ?? '',
        ];
    } catch (ConnectionException $e) {
        Log::error('Gemini API connection error', ['message' => $e->getMessage()]);
        throw new \Exception('AI service is temporarily unavailable');
    }
}

/**
 * Build the plan generation prompt.
 */
protected function buildPlanPrompt(array $goals): string
{
    $goalsJson = json_encode($goals, JSON_PRETTY_PRINT);
    return "You are an Islamic business strategy advisor. Generate a strategic plan for the following goals:\n\n{$goalsJson}\n\nProvide a structured plan with actionable steps that align with Islamic business principles (shariah compliance, ethical practices, transparency).";
}

/**
 * Build the insight generation prompt.
 */
protected function buildInsightPrompt(array $kpiData): string
{
    $kpiJson = json_encode($kpiData, JSON_PRETTY_PRINT);
    return "You are an Islamic business analytics advisor. Analyze the following KPI and performance data and provide insights:\n\n{$kpiJson}\n\nProvide actionable insights for improving Islamic business compliance and performance.";
}
```

### GeneratePlanRequest Validation

```php
<?php

namespace App\Http\Requests\Ai;

use Illuminate\Foundation\Http\FormRequest;

class GeneratePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'goals' => ['required', 'array'],
            'goals.*' => ['string'],
            'context' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'goals.required' => 'Goals are required for plan generation.',
            'goals.array' => 'Goals must be provided as a list.',
        ];
    }
}
```

### InsightRequest Validation

```php
<?php

namespace App\Http\Requests\Ai;

use Illuminate\Foundation\Http\FormRequest;

class InsightRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kpiData' => ['required', 'array'],
            'kpiData.totalTasks' => ['nullable', 'integer'],
            'kpiData.completedTasks' => ['nullable', 'integer'],
            'kpiData.completionRate' => ['nullable', 'numeric'],
            'kpiData.categories' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'kpiData.required' => 'KPI data is required for insight generation.',
            'kpiData.array' => 'KPI data must be provided as an object.',
        ];
    }
}
```

### AiController Extension

```php
public function generatePlan(GeneratePlanRequest $request): JsonResponse
{
    try {
        $goals = $request->input('goals');
        $context = $request->input('context');

        $result = $this->aiProxyService->generatePlan([
            'goals' => $goals,
            'context' => $context,
        ]);

        return response()->json([
            'data' => $result,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => $e->getMessage(),
        ], 503);
    }
}

public function insight(InsightRequest $request): JsonResponse
{
    try {
        $kpiData = $request->input('kpiData');

        $result = $this->aiProxyService->insight($kpiData);

        return response()->json([
            'data' => $result,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => $e->getMessage(),
        ], 503);
    }
}
```

### File Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── AiController.php           ← MODIFY (add methods)
│   │   └── Requests/Ai/
│   │       ├── ChatRequest.php            ← EXISTS
│   │       ├── GeneratePlanRequest.php    ← NEW
│   │       └── InsightRequest.php         ← NEW
│   └── Services/
│       └── AiProxyService.php             ← MODIFY (add methods)
├── routes/
│   └── api.php                             ← MODIFY
└── tests/
    └── Feature/
        └── Ai/
            ├── AiChatTest.php             ← EXISTS
            └── AiPlanAndInsightTest.php    ← NEW
```

### Previous Story Learnings (7-1)

1. **AiProxyService exists** - Already has `chat()` method with HTTP client config
2. **HTTP client pattern** - Use `Http::timeout($this->timeout)->post()`
3. **Error handling** - Throw `\Exception` with user-friendly message, return 503
4. **Controller pattern** - Inject service via constructor, try-catch in methods
5. **Test mocking** - Use `Http::fake()` to mock Gemini responses

### Integration with Dashboard

The insight endpoint can receive KPI data from the frontend's dashboard. The frontend can:
1. Call `/api/dashboard` to get KPI data
2. Pass that data to `/api/ai/insight` for AI-powered analysis

This keeps the backend stateless - the frontend assembles the context.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.2]
- [Source: _bmad-output/implementation-artifacts/7-1-ai-chat-proxy.md - Previous story]
- [Source: backend/app/Services/AiProxyService.php - Existing service]

## Dev Agent Record

### Agent Model Used

glm-5

### Debug Log References

N/A - tests could not be run due to PHP runtime not being available in the development environment.

### Completion Notes List

- All 6 tasks completed
- AiProxyService extended with `generatePlan()` and `insight()` methods
- GeneratePlanRequest and InsightRequest validation classes created
- AiController extended with new endpoint handlers
- Routes added for `/api/ai/generate-plan` and `/api/ai/insight`
- Feature tests created covering all acceptance criteria
- Implementation follows existing patterns from Story 7-1

### File List

**Modified:**
- `backend/app/Services/AiProxyService.php` - Added generatePlan() and insight() methods
- `backend/app/Http/Controllers/Api/AiController.php` - Added generatePlan() and insight() endpoint handlers
- `backend/routes/api.php` - Added routes for generate-plan and insight endpoints

**Created:**
- `backend/app/Http/Requests/Ai/GeneratePlanRequest.php` - Validation for plan generation
- `backend/app/Http/Requests/Ai/InsightRequest.php` - Validation for insight generation
- `backend/tests/Feature/Ai/AiPlanAndInsightTest.php` - Feature tests for both endpoints
