# MSYV2 - Manajemen Syariah OS

A comprehensive web-based platform for Islamic (Syariah-compliant) management. MSYV2 serves as a centralized dashboard for managing "amanah" (trusts/responsibilities) with AI-powered assistance and data-driven insights.

![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![Epics](https://img.shields.io/badge/Epics-8%2F8-blue)
![Stories](https://img.shields.io/badge/Stories-22%2F22-blue)

---

## Features

### Core Functionality

- **Task Management** - Create, track, and manage daily Islamic practice goals with progress tracking
- **Dashboard & Analytics** - Real-time KPI metrics, goal progress visualization, and trend charts
- **Knowledge Directory** - Hierarchical Islamic knowledge base with Quranic verses and Hadith
- **Tools Catalog** - 25+ Islamic productivity tools across 6 categories
- **AI Assistant** - Chat, strategic plan generation, and KPI-based insights (powered by Google Gemini)
- **Platform Administration** - User management, activity logs, and platform statistics

### Technical Features

- 🔐 Bearer token authentication (Laravel Sanctum)
- 🌓 Full dark mode support across all components
- 📊 Data export functionality
- 🔄 Automated task reset scheduling (daily/weekly/monthly/yearly)
- 🤖 Server-side AI API key protection
- ✨ Smooth animations with Framer Motion
- 🎨 Consistent code formatting with ESLint + Prettier

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19.1.1 + TypeScript 5.8.2 + Vite 6.4.1 + Tailwind CSS |
| **Backend** | Laravel 12 (PHP 8.2+) + Laravel Sanctum |
| **Database** | SQLite (Eloquent ORM) |
| **AI** | Google Gemini API |
| **Charts** | Recharts 3.7.0 |
| **Icons** | Lucide React |
| **Animation** | Framer Motion 12.34.0 |
| **Code Quality** | ESLint 9 + Prettier 3 |

---

## Project Structure

```
MSYV2/
├── frontend/              # React Single Page Application
│   ├── src/components/
│   │   ├── admin/         # Admin management (3 components)
│   │   ├── ai/            # AI assistant & generator (3 components)
│   │   ├── auth/          # Authentication (1 component)
│   │   ├── common/        # Shared UI components (5 components)
│   │   ├── dashboard/     # Dashboard features (7 components)
│   │   ├── layout/        # Shell components (2 components)
│   │   └── pages/         # Page-level routes (2 components)
│   ├── src/contexts/      # React contexts (AuthContext)
│   ├── src/lib/           # API services & utilities
│   └── src/types/         # TypeScript type definitions
│
└── backend/               # Laravel API
    ├── app/Http/Controllers/Api/
    ├── app/Models/
    ├── app/Services/
    ├── database/migrations/
    ├── database/seeders/
    └── tests/             # 30 test files
```

---

## API Endpoints

### Public
| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `POST /api/auth/register` | User registration |
| `POST /api/auth/login` | User login |
| `GET /api/islamic/*` | Quran/Hadith proxy |

### Protected (auth:sanctum)
| Endpoint | Description |
|----------|-------------|
| `/api/profile` | User profile CRUD |
| `/api/tasks` | Task management |
| `/api/categories` | Task categories |
| `/api/dashboard` | Dashboard metrics |
| `/api/directory` | Knowledge directory CRUD |
| `/api/tools` | Tools catalog |
| `/api/ai/chat` | AI chat proxy |
| `/api/ai/generate-plan` | Strategic plan generation |
| `/api/ai/insights` | KPI-based insights |

### Admin Only
| Endpoint | Description |
|----------|-------------|
| `/api/admin/stats` | Platform statistics |
| `/api/admin/logs` | Activity logs |
| `/api/admin/users` | User management |
| `/api/admin/tools` | Tool management |

---

## Getting Started

### Prerequisites

- PHP 8.2+
- Node.js 18+
- Composer
- SQLite

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### Development Login Credentials

After running `php artisan db:seed`, the following accounts are available for development:

| Role  | Email                      | Default Password |
|-------|----------------------------|------------------|
| Admin | `admin@syariahos.com`      | `Admin123!`      |
| User  | `budi.santoso@email.com`   | `User123!`       |

> **Note:** Passwords can be customized via environment variables:
> - `SEED_ADMIN_PASSWORD` - Admin account password
> - `SEED_USER_PASSWORD` - Regular user account password

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

### Environment Variables

**Backend (.env)**
```
GEMINI_API_KEY=your_gemini_api_key
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

---

## Testing

### Backend Tests
```bash
cd backend
php artisan test
```

Test coverage includes:
- Authentication & Authorization
- Task CRUD & Reset Scheduling
- Dashboard Metrics
- Directory Management
- AI Integration
- Admin Operations
- Security & Middleware

---

## Database Schema

- **users** - User accounts with extended preferences (theme, zakat rate, preferred akad, etc.)
- **personal_access_tokens** - Sanctum authentication tokens
- **activity_logs** - User activity tracking
- **categories** - Task categories
- **tasks** - User tasks with targets and schedules
- **task_histories** - Task completion history
- **directory_items** - Knowledge directory tree
- **tools** - Islamic productivity tools catalog

---

## Screenshots

*Screenshots can be added here after deployment*

---

## Production Deployment

Before deploying to production, remove the development-only shortcuts from the codebase:

### Remove Dev Login Shortcuts

**File:** `frontend/src/components/auth/Auth.tsx`

1. **Remove the `handleDevLogin` function** (lines marked with `DEV_FUNCTION_START/END`):
   ```typescript
   // Delete everything between:
   // DEV_FUNCTION_START: handleDevLogin
   // ...and...
   // DEV_FUNCTION_END: handleDevLogin
   ```

2. **Remove the Dev Buttons UI** (lines marked with `DEV_SHORTCUTS_START/END`):
   ```typescript
   // Delete everything between:
   // DEV_SHORTCUTS_START
   // ...and...
   // DEV_SHORTCUTS_END
   ```

3. **Quick removal using grep** (from project root):
   ```bash
   # Find all lines to remove:
   grep -n "DEV_FUNCTION_START\|DEV_FUNCTION_END\|DEV_SHORTCUTS_START\|DEV_SHORTCUTS_END" frontend/src/components/auth/Auth.tsx
   ```

### Additional Production Checklist

- [ ] Remove or rotate any test user credentials from database seeders
- [ ] Ensure `GEMINI_API_KEY` is set securely in environment
- [ ] Set `APP_ENV=production` in backend `.env`
- [ ] Disable debug mode: `APP_DEBUG=false`
- [ ] Configure proper CORS and Sanctum domains

---

## License

This project is private and proprietary.

---

## Acknowledgments

- Built with Laravel 12 and React 19
- AI powered by Google Gemini
- Icons by Lucide
