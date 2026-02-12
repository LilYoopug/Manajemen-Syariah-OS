# Story 6.1: Tools Browse, Filter, and Detail

Status: in-progress

## Story

As a user,
I want to browse, filter, and view detailed information about Islamic productivity tools,
So that I can discover tools for zakat calculation, shariah contracts, and business compliance.

## Acceptance Criteria

1. **Browse Tools**
   - Given an authenticated user
   - When they GET `/api/tools`
   - Then all tools are returned via ToolResource collection
   - And the response format is `{ "data": [...] }`
   - And each tool includes: id, name, category, description, inputs, outputs, benefits, shariaBasis, link, relatedDirectoryIds, relatedDalilText, relatedDalilSource

2. **Filter Tools by Category**
   - Given an authenticated user
   - When they GET `/api/tools?category=Keuangan`
   - Then only tools matching that category are returned
   - And the category filter matches exact category string

3. **View Tool Detail**
   - Given an authenticated user
   - When they GET `/api/tools/{id}`
   - Then the complete tool information is returned via ToolResource
   - And all fields are included (inputs, outputs, benefits, shariaBasis, relatedDalilText, relatedDalilSource)

4. **Tool Not Found**
   - Given an authenticated user
   - When they GET `/api/tools/{id}` with non-existent ID
   - Then a 404 response is returned

5. **Unauthenticated Access Denied**
   - Given an unauthenticated request
   - When they GET `/api/tools` or `/api/tools/{id}`
   - Then a 401 response is returned

6. **Seeded Tools Data**
   - Given the ToolSeeder exists
   - When the database is seeded
   - Then 25 tools from `frontend/src/constants/index.ts` TOOLS_DATA are populated
   - And categories include: Individu/Keluarga, Bisnis Islami, Lembaga/Komunitas, Keuangan/Investasi, Edukasi, Sosial/Umat

## Tasks / Subtasks

- [x] Task 1: Create ToolSeeder (AC: 6)
  - [x] Create `database/seeders/ToolSeeder.php`
  - [x] Seed all 25 tools from frontend TOOLS_DATA
  - [x] Map frontend fields to database columns
  - [x] Handle relatedDalil as related_dalil_text and related_dalil_source
  - [x] Register in DatabaseSeeder

- [x] Task 2: Create ToolController (AC: 1-5)
  - [x] Create `app/Http/Controllers/Api/ToolController.php`
  - [x] Add index() method for listing all tools
  - [x] Add show() method for single tool detail
  - [x] Implement category filtering via query parameter
  - [x] Use ToolResource for responses

- [x] Task 3: Add Tool routes (AC: 1-5)
  - [x] Add `GET /api/tools` route
  - [x] Add `GET /api/tools/{id}` route
  - [x] Routes protected with `auth:sanctum` middleware

- [x] Task 4: Create feature tests (AC: 1-5)
  - [x] Create `tests/Feature/ToolTest.php`
  - [x] Test list all tools
  - [x] Test filter by category
  - [x] Test view tool detail
  - [x] Test tool not found (404)
  - [x] Test unauthenticated requests
  - [x] Test seeder creates 25 tools

## Dev Notes

### Pre-existing Components

The following components already exist and should be reused:
- `backend/app/Models/Tool.php` - Model with fillable fields and casts
- `backend/database/migrations/2026_02_12_000006_create_tools_table.php` - Migration
- `backend/app/Http/Resources/ToolResource.php` - Resource transformer

### Database Schema (Already Exists)

```php
$table->id();
$table->string('name');
$table->string('category');
$table->text('description');
$table->json('inputs')->nullable();
$table->json('outputs')->nullable();
$table->json('benefits')->nullable();
$table->text('sharia_basis')->nullable();
$table->string('link')->nullable();
$table->json('related_directory_ids')->nullable();
$table->text('related_dalil_text')->nullable();
$table->string('related_dalil_source')->nullable();
$table->timestamps();
$table->index(['category']);
```

### Frontend TypeScript Interface

```typescript
export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  inputs: string;
  outputs: string;
  benefits: string;
  shariaBasis?: string;
  relatedDalil?: { text: string; source: string };
  relatedDirectoryIds?: string[];
  icon: React.ElementType; // Frontend only - not stored
  link?: string;
  createdAt?: number;
}

export enum ToolCategory {
  Individu = "Individu/Keluarga",
  Bisnis = "Bisnis Islami",
  Lembaga = "Lembaga/Komunitas",
  Keuangan = "Keuangan/Investasi",
  Edukasi = "Edukasi",
  Sosial = "Sosial/Umat",
}
```

### Tool Data Mapping

Frontend `TOOLS_DATA` to Database mapping:
- `id` (string like 't1', 't2') → NOT auto-increment, use string ID or generate numeric ID
- `name` → `name`
- `category` → `category` (store enum string value)
- `description` → `description`
- `inputs` → `inputs` (JSON array or string)
- `outputs` → `outputs` (JSON array or string)
- `benefits` → `benefits` (JSON array or string)
- `shariaBasis` → `sharia_basis`
- `relatedDalil.text` → `related_dalil_text`
- `relatedDalil.source` → `related_dalil_source`
- `relatedDirectoryIds` → `related_directory_ids` (JSON array)
- `link` → `link`
- `icon` → NOT stored (frontend only)

### ToolSeeder Data Example

```php
$tools = [
    [
        'name' => 'Financial Planner Syariah',
        'category' => 'Individu/Keluarga',
        'description' => 'Alokasikan penghasilan sesuai kaidah syariah.',
        'inputs' => json_encode(['Penghasilan', 'Kebutuhan Pokok', 'Utang']),
        'outputs' => json_encode(['Alokasi Zakat', 'Sedekah', 'Tabungan Haji', 'Investasi Halal']),
        'benefits' => json_encode(['Mencapai keberkahan finansial.']),
        'sharia_basis' => 'Dan orang-orang yang apabila membelanjakan (harta), mereka tidak berlebihan, dan tidak (pula) kikir...',
        'link' => 'https://example.com/planner',
        'related_directory_ids' => json_encode(['m5']),
        'related_dalil_text' => 'Dan orang-orang yang apabila membelanjakan (harta)...',
        'related_dalil_source' => 'QS. Al-Furqan: 67',
    ],
    // ... more tools
];
```

### Input/Output/Benefits Storage

The frontend has these as strings, but database stores as JSON. Options:
1. Store as JSON array of strings (split by comma or structure as array)
2. Store as JSON string containing the original string

Recommended: Store as JSON array for structured data:
```php
'inputs' => json_encode(['Penghasilan', 'Kebutuhan Pokok', 'Utang']),
```

### Controller Implementation

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ToolResource;
use App\Models\Tool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ToolController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Tool::query();

        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        $tools = $query->get();

        return response()->json([
            'data' => ToolResource::collection($tools),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $tool = Tool::findOrFail($id);

        return response()->json([
            'data' => new ToolResource($tool),
        ]);
    }
}
```

### File Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── ToolController.php         ← NEW
│   │   └── Resources/
│   │       └── ToolResource.php           ← EXISTS
│   └── Models/
│       └── Tool.php                        ← EXISTS
├── database/
│   ├── migrations/
│   │   └── *_create_tools_table.php       ← EXISTS
│   └── seeders/
│       ├── DatabaseSeeder.php             ← MODIFY
│       └── ToolSeeder.php                  ← NEW
├── routes/
│   └── api.php                             ← MODIFY
└── tests/
    └── Feature/
        └── ToolTest.php                    ← NEW
```

### Previous Story Learnings (5-1, 5-2)

1. **ToolResource exists** - Already has toArray() method with camelCase keys
2. **Tool model exists** - Already has fillable fields and JSON casts
3. **Migration exists** - Table already created with category index
4. **JSON field handling** - inputs/outputs/benefits/related_directory_ids cast as array
5. **Simple read-only** - No CRUD write operations needed for user-facing tools

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.1]
- [Source: backend/app/Models/Tool.php - Model]
- [Source: backend/database/migrations/2026_02_12_000006_create_tools_table.php - Schema]
- [Source: backend/app/Http/Resources/ToolResource.php - Resource]
- [Source: frontend/src/constants/index.ts - TOOLS_DATA]
- [Source: frontend/src/types/index.ts - Tool interface]

## Dev Agent Record

### Agent Model Used

glm-5

### Debug Log References

N/A - PHP runtime not available in environment

### Completion Notes List

1. PHP runtime not available in environment - tests written but not executed
2. All 4 tasks completed:
   - Task 1: ToolSeeder created with all 25 tools from frontend TOOLS_DATA
   - Task 2: ToolController created with index() and show() methods
   - Task 3: Tool routes added to api.php within auth:sanctum middleware
   - Task 4: ToolTest.php created with 13 test cases
3. Pre-existing components reused: Tool model, migration, ToolResource
4. Input/outputs/benefits stored as JSON arrays for structured data
5. ToolSeeder registered in DatabaseSeeder alongside CategorySeeder and DirectorySeeder

### File List

**Created:**
- backend/database/seeders/ToolSeeder.php
- backend/app/Http/Controllers/Api/ToolController.php
- backend/tests/Feature/ToolTest.php

**Modified:**
- backend/database/seeders/DatabaseSeeder.php (added ToolSeeder)
- backend/routes/api.php (added GET /api/tools and GET /api/tools/{id})
