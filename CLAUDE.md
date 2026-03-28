# CLAUDE.md

## Project Overview

**Sổ Nhà Thuốc** — Vietnamese pharmacy management SaaS for independent pharmacies.
Multi-tenant, multi-location, role-based (OWNER / MANAGER / STAFF), offline-first PWA.
All user-facing text is in **Vietnamese**.

## Quick Commands

```bash
pnpm dev              # Dev server on port 5174
pnpm build            # TypeScript check + Vite production build
pnpm lint             # ESLint
pnpm format:check     # Prettier check
pnpm format           # Prettier fix
pnpm knip             # Find unused exports/dependencies
npx tsc --noEmit      # Type-check only (no emit)
```

## Tech Stack

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **TanStack Router** (file-based routing with auto code-splitting)
- **TanStack React Query** (server state, offline persistence via IndexedDB)
- **Supabase** (PostgreSQL + Auth + RPC)
- **Shadcn UI** + **TailwindCSS 4** (components in `src/components/ui/`)
- **Zustand** (complex feature state only: sale-orders, purchase-orders)
- **React Hook Form** + **Zod** (form validation)
- **PWA** via `vite-plugin-pwa` with IndexedDB offline mutation queue
- **Package manager**: pnpm

## Project Structure

```
src/
├── assets/              # Logo, images
├── client/              # Repo singletons + React Query option factories
│   ├── index.ts         # All repo singletons instantiated here
│   ├── provider.tsx     # AuthUserProvider context
│   ├── hooks.ts         # useUser(), useLocations()
│   └── queries/         # One file per domain entity (22 files)
├── components/          # Shared UI components
│   ├── ui/              # Shadcn components (DO NOT modify directly)
│   ├── layout/          # App shell: sidebar, header, nav
│   └── data-table/      # Data table wrappers
├── config/              # App config (fonts)
├── context/             # Global React context providers (6 files)
├── features/            # 25 domain features (main business logic)
├── hooks/               # Shared custom hooks (8 files)
├── lib/                 # Utilities: permissions, error mapping, formatters
├── routes/              # TanStack file-based routes (40+ routes)
├── services/            # Backend integration
│   ├── supabase/        # Client, auth, models (24), repos (19)
│   │   ├── client.ts            # BasePharmacySupabaseClient type + factory
│   │   ├── auth/                # Auth wrapper methods
│   │   ├── database.types.ts    # Auto-generated Supabase types
│   │   ├── database/model/      # Type aliases per table
│   │   ├── database/repo/       # Repository factories (one per domain)
│   │   └── database/utils/      # Shared helpers (reserved, currently empty)
│   └── offline/         # IndexedDB mutation queue + query persister
└── styles/              # Global CSS (TailwindCSS)
```

## Data Flow

```
Supabase DB
  → Repository factory (src/services/supabase/database/repo/*Repo.ts)
  → Repo singleton (src/client/index.ts)
  → Query Options factory (src/client/queries/*.ts)
  → useQuery() / useSuspenseQuery() in feature component
  → UI
```

Mutations follow the reverse: UI → useMutation → repo method → Supabase.

## Feature Folder Patterns

### Simple CRUD (customers, products, categories, suppliers, locations, staff, bank-accounts)

```
feature-name/
├── index.tsx                          # Main page component
├── components/
│   ├── {name}-table.tsx               # TanStack Table wrapper
│   ├── {name}-columns.tsx             # ColumnDef<T>[] definitions
│   ├── {name}-provider.tsx            # Dialog state context (useDialogState)
│   ├── {name}-dialogs.tsx             # Dialog orchestrator (renders all dialogs)
│   ├── {name}-action-dialog.tsx       # Add/Edit form dialog
│   ├── {name}-delete-dialog.tsx       # Delete confirmation dialog
│   ├── {name}-primary-buttons.tsx     # Header action buttons
│   └── data-table-row-actions.tsx     # Row dropdown menu
└── data/
    └── schema.ts                      # Zod schemas + inferred TypeScript types
```

### Complex Order (sale-orders, purchase-orders)

```
feature-name/
├── index.tsx
├── components/
├── data/
│   ├── types.ts                       # TypeScript types
│   └── {name}-helper.ts              # Business logic / data transformation
├── hooks/
│   ├── use-{name}-mutations.ts        # Mutation logic + offline fallback
│   └── use-keyboard-shortcuts.ts
└── stores/                            # Zustand store (complex state only)
    └── {name}-store.ts
```

### Detail Page (customer-details, supplier-details, sale-order-detail)

```
feature-name/
├── index.tsx
├── components/
│   ├── {name}-header.tsx
│   ├── {name}-info-card.tsx
│   ├── {name}-summary-cards.tsx
│   └── {name}-tabs.tsx
└── data/
    └── schema.ts
```

## Core Patterns

### Repository Pattern

File: `src/services/supabase/database/repo/{entity}Repo.ts`

```typescript
import { BasePharmacySupabaseClient } from '../../client'
import { Entity, EntityInsert, EntityUpdate } from '../model'

export const createEntityRepository = (client: BasePharmacySupabaseClient) => ({
  async getAll(tenantId: string): Promise<Entity[]> {
    const { data, error } = await client
      .from('entities')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data as Entity[]
  },
  // ... more methods
})
```

Rules: see `docs/supabase-rules.md` for all 11 rules.

### Query Options Pattern

File: `src/client/queries/{entity}.ts`

```typescript
import { queryOptions } from '@tanstack/react-query'
import { entityRepo } from '..'

export const getEntityQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ['entities', tenantId],
    queryFn: async () => entityRepo.getAll(tenantId),
    staleTime: 5 * 60 * 1000, // 5 min for offline-critical data
  })
```

- Query key convention: `['entity-name', tenantId, ...qualifiers]`
- Detail queries: `['entity-name', tenantId, 'detail', entityId]`

### Mutation Pattern

```typescript
const mutation = useMutation({
  mutationFn: (values: FormType) =>
    entityRepo.create({ tenant_id: tenantId, ...values }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['entities', tenantId] })
    form.reset()
    onOpenChange(false)
    toast.success('Thêm thành công')
  },
  onError: (error) => toast.error(mapSupabaseError(error)),
})
```

### Dialog State Provider Pattern

File: `src/features/{name}/components/{name}-provider.tsx`

```typescript
type DialogType = 'add' | 'edit' | 'delete'

// Uses useDialogState<T>() hook from @/hooks/use-dialog-state
// Provides: { open, setOpen, currentRow, setCurrentRow }
// Consumed via: useEntityName() custom hook
```

### Route Pattern

Route files in `src/routes/` are **thin wrappers** — they import and render feature components.
Auth guard lives in `src/routes/_authenticated/route.tsx`.

### Permission System

File: `src/lib/permissions.ts`

- 3 roles: `OWNER`, `MANAGER`, `STAFF`
- 2 tenant types: `1_NORMAL` (single location), `2_PRO` (multi-location)
- Functions: `canView()`, `canEdit()`, `getLocationScope()`, `canAccessRoute()`
- STAFF scoped to their assigned location only
- `1_NORMAL` tenants have capped permissions for locations/staffs

### Error Handling

File: `src/lib/error-mapper.ts`

- `mapSupabaseError(error)` → Vietnamese user-friendly message
- Handles: PostgreSQL codes, HTTP status, Auth errors, custom exceptions
- Used in mutation `onError` callbacks with `toast.error()`

## Coding Conventions

### Naming

| What | Convention | Example |
|------|-----------|---------|
| Feature folders | kebab-case | `sale-orders`, `customer-details` |
| Components | PascalCase | `CustomerTable.tsx` |
| Hooks | use- prefix, kebab-case file | `use-dialog-state.tsx` |
| Repos | camelCase + Repo suffix | `customersRepo.ts` |
| Factory functions | create + PascalCase + Repository | `createCustomerRepository` |
| Query options | get + Name + QueryOptions | `getCustomersQueryOptions` |
| Zod schemas | camelCase + Schema suffix | `customerSchema` |

### TypeScript

- Path alias: `@/*` → `src/*`
- Supabase model types: derive from `Tables<'table'>`, `TablesInsert<'table'>`, `TablesUpdate<'table'>`
- Feature-level types in `data/schema.ts` using Zod
- Service-level types in `services/supabase/database/model/`

### UI & Formatting

- All user-facing text in **Vietnamese**
- Currency: `formatCurrency()` from `@/lib/utils`
- Vietnamese text search: `normalizeSearchValue()` handles diacritics (đ, accents)
- Date formatting: `formatDateLabel()`, `formatDateTimeLabel()` with `vi-VN` locale
- Shadcn components in `src/components/ui/` — **DO NOT modify** these directly

### Imports

Organized by: React → external libs → `@/` aliases → relative imports.
Prettier plugin auto-sorts imports (`@trivago/prettier-plugin-sort-imports`).

## Working Guidelines

- Prefer small, isolated changes that keep existing behavior stable.
- If existing code conflicts with documented rules, prioritize compatibility first, then improve in separate cleanup commits.

## Anti-Patterns (DO NOT)

- **DO NOT** make raw `client.from()` calls in UI/feature code — use repository methods
- **DO NOT** create ad-hoc Supabase clients — use the singleton from `@/client`
- **DO NOT** put business logic in route files — routes are thin wrappers
- **DO NOT** modify `src/components/ui/` files — Shadcn managed, override via wrapper components
- **DO NOT** use `console.log` — ESLint `no-console: error` rule
- **DO NOT** import from `database.types.ts` directly in features — use model type aliases
- **DO NOT** duplicate `client.auth.getUser()` in repos — use shared helper in utils

## Adding a New CRUD Feature — Checklist

1. Create model types in `src/services/supabase/database/model/{entity}.ts`
2. Export from `src/services/supabase/database/model/index.ts`
3. Create repository in `src/services/supabase/database/repo/{entity}Repo.ts`
4. Export from `src/services/supabase/index.ts`
5. Create repo singleton in `src/client/index.ts`
6. Create query options in `src/client/queries/{entity}.ts`
7. Create feature folder under `src/features/{entity}/` following Simple CRUD pattern
8. Create route file in `src/routes/_authenticated/{entity}/index.tsx`
9. Add sidebar entry in `src/components/layout/data/sidebar-data.tsx`
10. Add permission entry in `src/lib/permissions.ts` (PERMISSIONS matrix + ROUTE_FEATURE_MAP)
11. Run `pnpm build` and `pnpm lint` to verify

## Key Utilities Reference

| Utility | Location | Purpose |
|---------|----------|---------|
| `cn()` | `src/lib/utils.ts` | Merge Tailwind classes (clsx + twMerge) |
| `formatCurrency()` | `src/lib/utils.ts` | Format numbers as Vietnamese currency |
| `normalizeSearchValue()` | `src/lib/utils.ts` | Normalize Vietnamese text for search |
| `includesSearchValue()` | `src/lib/utils.ts` | Case/diacritics-insensitive search |
| `formatDateLabel()` | `src/lib/utils.ts` | Format ISO date to vi-VN |
| `formatDateTimeLabel()` | `src/lib/utils.ts` | Format ISO datetime to vi-VN |
| `mapSupabaseError()` | `src/lib/error-mapper.ts` | Supabase error → Vietnamese message |
| `canView()` / `canEdit()` | `src/lib/permissions.ts` | RBAC permission checks |
| `getLocationScope()` | `src/lib/permissions.ts` | Location access scope |
| `useDialogState()` | `src/hooks/use-dialog-state.tsx` | Dialog open/close state |
| `useUser()` | `src/client/hooks.ts` | Current authenticated user context |

## Environment Variables

```
VITE_SUPABASE_URL       # Supabase project URL
VITE_SUPABASE_ANON_KEY  # Supabase anonymous key
```

DO NOT commit `.env` files.

## Related Documentation

- `docs/supabase-rules.md` — 11 detailed rules for Supabase repository pattern
