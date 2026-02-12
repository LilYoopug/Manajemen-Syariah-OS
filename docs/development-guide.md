# Development Guide: Manajemen Syariah OS

## Prerequisites

- **Node.js** (Latest LTS recommended)
- **npm** or **yarn**
- **Git** (for version control)
- **Code Editor** (VS Code recommended)

## Environment Setup

### 1. Clone/Navigate to Project

```bash
cd /home/Tubagus/MSYV2/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get API Key:**
1. Visit [Google AI Studio](https://ai.studio.google.com/)
2. Create or select a project
3. Generate an API key
4. Copy to `.env.local`

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components (feature-based)
│   ├── constants/      # Static data and mock generators
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── types/          # TypeScript definitions
│   ├── App.tsx         # Root component
│   └── index.tsx       # Entry point
├── .env.local          # Environment variables
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── vite.config.ts      # Vite configuration
```

## Development Workflow

### Adding a New Component

1. **Create component file** in appropriate folder:
   ```bash
   # Example: New dashboard widget
   touch src/components/dashboard/NewWidget.tsx
   ```

2. **Write component** with TypeScript:
   ```typescript
   import React from 'react';
   import { SomeIcon } from '@/components/common/Icons';
   
   interface NewWidgetProps {
     title: string;
   }
   
   const NewWidget: React.FC<NewWidgetProps> = ({ title }) => {
     return (
       <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl">
         <h3>{title}</h3>
       </div>
     );
   };
   
   export default NewWidget;
   ```

3. **Export from barrel file** (`components/index.ts`):
   ```typescript
   export { default as NewWidget } from './dashboard/NewWidget';
   ```

4. **Use in parent component**:
   ```typescript
   import { NewWidget } from '@/components';
   ```

### Adding New Types

1. **Add to `src/types/index.ts`**:
   ```typescript
   export interface NewEntity {
     id: string;
     name: string;
   }
   ```

2. **Import where needed**:
   ```typescript
   import type { NewEntity } from '@/types';
   ```

### Adding a New Icon

1. **Find icon** on [lucide.dev](https://lucide.dev/icons/)

2. **Add to `src/components/common/Icons.tsx`**:
   ```typescript
   export { IconName as MyIconName } from 'lucide-react';
   ```

3. **Use in component**:
   ```typescript
   import { MyIconName } from '@/components/common/Icons';
   ```

### Adding Static Data

1. **Add to `src/constants/index.ts`**:
   ```typescript
   export const NEW_DATA = [
     { id: '1', name: 'Item 1' },
     { id: '2', name: 'Item 2' },
   ];
   ```

2. **Import and use**:
   ```typescript
   import { NEW_DATA } from '@/constants';
   ```

## Coding Standards

### TypeScript

- **Always use types** for props and state
- **Use interfaces** for object shapes
- **Use type** for unions and simple aliases
- **Enable strict mode** (already configured)

### Component Structure

```typescript
// 1. Imports
import React from 'react';
import { SomeIcon } from '@/components/common/Icons';
import type { SomeType } from '@/types';

// 2. Props Interface
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

// 3. Component
const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState('');
  
  // Effects
  useEffect(() => {
    // side effect
  }, []);
  
  // Handlers
  const handleClick = () => {
    // handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 4. Export
export default Component;
```

### Styling Guidelines

**Use Tailwind CSS utility classes:**

```tsx
// Good
<div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">

// Bad (avoid inline styles)
<div style={{ backgroundColor: 'white', padding: '24px' }}>
```

**Common patterns:**

| Pattern | Usage |
|---------|-------|
| `bg-white dark:bg-gray-800` | Card backgrounds |
| `text-gray-800 dark:text-gray-200` | Primary text |
| `p-4 sm:p-6 lg:p-8` | Responsive padding |
| `rounded-2xl` | Border radius |
| `shadow-md` | Elevation |
| `space-y-4` | Vertical spacing |
| `flex items-center justify-between` | Flexbox layout |

**Use `cn()` utility for conditional classes:**

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>
```

### Dark Mode Support

Always add dark mode variants:

```tsx
<div className="
  bg-white text-gray-800
  dark:bg-gray-800 dark:text-gray-200
">
```

## State Management

### Local State (useState)

```typescript
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
```

### Persisted State (useLocalStorage)

```typescript
const [data, setData] = useLocalStorage<DataType>(
  'storage_key',
  defaultValue
);
```

### Global State

Currently using prop drilling. For larger scale, consider:
- React Context API
- Zustand
- Redux Toolkit

## Working with the AI Assistant

### System Instructions

Located in `AIAssistant.tsx`:

```typescript
const SYSTEM_INSTRUCTION_BASE = `You are an expert AI assistant...`;
```

### Context Data

Dashboard data is passed to AI for contextual responses:

```typescript
const formatContextData = () => {
  // Formats KPI and Goal data for AI context
};
```

### Changing the Model

```typescript
const responseStream = await ai.models.generateContentStream({
  model: "gemini-3-flash-preview", // Change model here
  // ...
});
```

## Testing

### Manual Testing

1. **Authentication:**
   - Test login with admin credentials
   - Test login with user credentials
   - Test logout

2. **Dashboard:**
   - Test date range filters
   - Test PDF/Excel export
   - Test AI insights

3. **Directory:**
   - Test CRUD operations in edit mode
   - Test search functionality
   - Test tree expansion

4. **AI Assistant:**
   - Test prompts
   - Test with dashboard context
   - Test streaming responses

### Development Shortcuts

Auth component includes dev buttons:
- "Dev Admin" - Login as admin
- "Dev User" - Login as user

## Debugging

### Browser DevTools

1. **React DevTools**: Install browser extension
2. **Network Tab**: Monitor API calls
3. **Console**: View errors and logs

### Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Check path alias or run `npm install` |
| Type errors | Check TypeScript interfaces |
| Styles not applied | Check Tailwind class names |
| API errors | Verify `.env.local` has correct API key |

### Environment Variable Issues

If `process.env.API_KEY` is undefined:
1. Check `.env.local` exists
2. Restart dev server after changing `.env.local`
3. Verify variable name matches (Vite uses `import.meta.env`)

## Build and Deployment

### Production Build

```bash
npm run build
```

Output in `dist/` folder.

### Preview Build

```bash
npm run preview
```

### Static Hosting

Upload `dist/` contents to:
- Netlify
- Vercel
- GitHub Pages
- Any static host

## Adding New Dependencies

```bash
npm install package-name
npm install -D package-name  # Dev dependency
```

## Path Aliases

Configured in `vite.config.ts`:

| Alias | Points to |
|-------|-----------|
| `@` | `src/` |
| `@/types` | `src/types/index.ts` |
| `@/constants` | `src/constants/index.ts` |
| `@/hooks` | `src/hooks/` |
| `@/components/common` | `src/components/common/` |

## Git Workflow

### Before Committing

1. **Test your changes**
2. **Check for TypeScript errors**
3. **Review your code**

### Commit Message Format

```
[Component/Feature]: Brief description

- Detail 1
- Detail 2
```

Example:
```
[Dashboard]: Add export functionality

- Add PDF export using jsPDF
- Add Excel export using XLSX
- Update Dashboard component
```

## Resources

- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev/guide/)
- [Lucide Icons](https://lucide.dev/icons/)
- [Recharts Docs](https://recharts.org/en-US/)

---

*Generated by BMad Master - Document Project Workflow*
*Date: 2026-02-11*
