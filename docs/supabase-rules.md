# Supabase Repository Rules

These rules are based on the existing template in `src/services/supabase/**`.

## 1) Folder Layout
- `src/services/supabase/client.ts`: typed Supabase client factory only.
- `src/services/supabase/auth/`: auth wrapper/factory methods only.
- `src/services/supabase/database/model/index.ts`: table/entity type aliases, `Insert`, `Update` types.
- `src/services/supabase/database/repo/*Repo.ts`: data-access repositories (one domain per file).
- `src/services/supabase/database/utils/index.ts`: shared helpers (auth checks, date helpers, cross-repo utilities).
- `src/services/supabase/index.ts`: package barrel exports; only export files that actually exist.

## 2) Client And Type Rules
- Use a single typed client alias (`BasePharmacySupabaseClient`) based on `Database` from `database.types.ts`.
- Keep client config centralized in `createBasePharmacyClient(...)`.
- Do not create ad-hoc Supabase clients in features/components.

## 3) Repository Construction Pattern
- Every repo must follow factory style:
  - `export const createXRepository = (client: BasePharmacySupabaseClient) => ({ ...methods })`
- Repository methods should:
  - use explicit input types (`number`, `string`, `Insert`, `Update`, or domain DTOs),
  - return explicit output types (`Promise<T>`, `Promise<T | null>`, `Promise<void>`, etc),
  - throw Supabase errors immediately (`if (error) throw error`).
- Keep methods cohesive by domain; avoid "god repo" files.

## 4) Auth And User Context
- If method requires authenticated user id, call shared helper (`getUser(client)`) from utils.
- Do not duplicate `client.auth.getUser()` logic in every repo method.
- Unauthorized states must fail fast with explicit errors.

## 5) Query Style
- Always scope by tenant/family context where applicable (`.eq("family_id", familyId)`).
- Prefer deterministic ordering for lists (`.order(...)`).
- Use explicit `select(...)` projections for relation-heavy queries.
- Keep pagination server-side via `.range(start, end)` when needed.
- Keep RPC calls wrapped in repo methods, with typed params object.

## 6) Model And DTO Types
- Define/consume table model aliases from `database/model/index.ts`.
- For create/update methods, prefer `TablesInsert`/`TablesUpdate` aliases via exported model types.
- Avoid importing model types from external package paths when local types exist.

## 7) Error Handling And Return Shapes
- Standard handling pattern:
  - execute query,
  - throw on `error`,
  - normalize nullable/array return (`return data ?? []`, `return data ?? null`).
- Keep return shapes stable; do not return mixed type unions unless required.

## 8) Side Effects And Cross-Entity Logic
- If a method does multi-step workflow (example: recurring task follow-up), keep logic in repo or shared utils.
- Complex date/recurrence logic should stay in utils and be unit-testable.
- Avoid `console.log` in committed repository methods; replace with structured logging only if project logging exists.

## 9) Exports And Naming
- File names use `camelCase` with `Repo` suffix (example: `taskRepo.ts`).
- Factory names use `create` + PascalCase + `Repository` (example: `createTaskRepository`).
- Keep `src/services/supabase/index.ts` synchronized with existing files only.

## 10) Frontend Boundary
- UI/features/routes should call repository methods, not raw `client.from(...)`.
- Keep Supabase-specific types close to service layer and expose domain-safe types upward.

## 11) Checklist For New Repo File
- Add file under `database/repo/`.
- Export factory function with typed client input.
- Add typed methods with explicit returns and error handling.
- Reuse model aliases and shared utils.
- Add barrel export in `src/services/supabase/index.ts` only if needed and file exists.
- Run `pnpm lint` and `pnpm build` when practical.
