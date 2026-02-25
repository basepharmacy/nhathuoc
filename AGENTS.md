# Project Agent Notes

## Project Context
- This codebase currently starts from a dashboard template and will be updated incrementally.
- Prefer small, isolated changes that keep template behavior stable unless a feature request requires broader refactor.
- Keep current stack conventions: React + Vite + TanStack Router + TypeScript.

## Source Of Truth For Supabase
- Supabase implementation lives under `src/services/supabase/`.
- Follow the conventions documented in `docs/supabase-rules.md` for all new Supabase work.
- If existing code conflicts with rules, prioritize compatibility first, then improve in separate cleanup commits.

## Supabase Scope Guardrails
- Keep Supabase data-access logic inside repository factory files in `src/services/supabase/database/repo/`.
- Keep table/model aliases in `src/services/supabase/database/model/index.ts`.
- Keep shared Supabase utilities in `src/services/supabase/database/utils/index.ts`.
- Avoid leaking raw Supabase calls into UI components or route files.

## Quality Baseline
- New repository methods should be typed and return stable shapes.
- Always handle Supabase errors explicitly (`if (error) throw error`).
- Validate build/lint impact after Supabase changes when possible.
