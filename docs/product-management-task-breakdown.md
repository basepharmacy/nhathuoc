# Product Management Task Breakdown

Reference plan:

- [product-management-implementation-plan.md](C:\Users\dungd\OneDrive\Desktop\Work\outsourcing\nhathuoc\docs\product-management-implementation-plan.md)

How to use:

- Complete tasks in order.
- Each task links to the related section in the main plan.
- Do not skip dependency tasks.
- When not needed, just run `npx tsc -b` command to check type issues, dont run build command.
- After done coding, review the written code before continue. If any issues found, fix them first.
If anything make u wonder and cannot decide, stop n ask user.
- After finishing any task/phase, immediately update this file's checkbox and progress tracker in the same change.

---

## Phase 0 - Setup

- [x] `T0.1` Read main plan sections 2, 3, 12, 13 (scope, rules, order, DoD).
  - Ref: main plan sections `2`, `3`, `12`, `13`
- [x] `T0.2` Create working branch for feature work.
  - Ref: main plan section `12`
- [x] `T0.3` Verify local project runs before changes (`pnpm install`, `pnpm build` baseline).
  - Ref: main plan section `9.5`

---

## Phase 1 - Database Foundation

> Note: `products`, `product_units`, and `categories` already exist in DB and in `database.types.ts`. No new DB objects are required.

- [x] `T1.1` Verify `products`, `product_units`, and `categories` exist in generated types.
  - Ref: main plan section `4.1`, `4.3`
- [x] `T1.2` Confirm no migration is required for current scope.
  - Ref: main plan section `4.2`
- [x] `T1.3` Record schema baseline for downstream tasks (table fields + constraints used by create flow).
  - Ref: main plan section `7.1`, `7.2`

Dependencies:

- `T1.2` depends on `T1.1`
- `T1.3` depends on `T1.1`

---

## Phase 2 - Supabase Service Layer

- [x] `T2.1` Add re-exports in `src/services/supabase/database/model/index.ts`.
  - Pattern: define types inside the repo file, then add `export * from '../repo/productsRepo'` to model index.
  - Do NOT define `Tables<...>` aliases directly in model/index.ts.
  - Ref: main plan section `5.1`
- [x] `T2.2` Create `src/services/supabase/database/repo/productsRepo.ts` factory.
  - Ref: main plan section `5.2`
- [x] `T2.3` Implement `getProductsByTenantId(tenantId)` and define `ProductWithMeta` type.
  - Join: `select('*, product_units(*), categories(name)')`; order by `created_at desc`.
  - Ref: main plan section `5.2`
- [x] `T2.4` Implement `createProductWithUnits(input)`.
  - `cost_price` is NOT NULL with no default in `product_units` — must be included in `CreateProductUnitInput` as required.
  - Ref: main plan section `5.2`, `5.2.1`, `5.2.2`
- [x] `T2.5` Implement `searchByName(tenantId, keyword, limit)` in `productsRepo`.
  - Ref: main plan section `5.3`
- [x] `T2.6` Export new repos in `src/services/supabase/index.ts`.
  - Ref: main plan section `5.4`
- [x] `T2.7` Wire repo instances in `src/client/index.ts`.
  - Ref: main plan section `5.4`
- [x] `T2.8` Add query options in `src/client/queries.ts`.
  - Add `getProductsQueryOptions(tenantId)`
  - Do NOT add a query option for autocomplete search — use direct debounced async call in component instead.
  - Ref: main plan section `5.4`

Dependencies:

- `T2.3` and `T2.4` depend on `T2.2`
- `T2.5` depends on `T2.2`
- `T2.6` depends on `T2.4` + `T2.5`
- `T2.7` depends on `T2.6`
- `T2.8` depends on `T2.7`

---

## Phase 3 - Products Route and Screen Scaffold

- [x] `T3.1` Create route file `src/routes/_authenticated/products/index.tsx`.
  - Ref: main plan section `6.2`
- [x] `T3.2` Create feature root `src/features/products/index.tsx`.
  - Ref: main plan section `6.1`
- [x] `T3.3` Create base data schema file `src/features/products/data/schema.ts`.
  - Ref: main plan section `6.1`
- [x] `T3.4` Create provider/dialog state `products-provider.tsx`.
  - Ref: main plan section `6.1`
- [x] `T3.5` Create table + columns files (`products-table.tsx`, `products-columns.tsx`).
  - Ref: main plan section `8.1`, `6.1`
- [x] `T3.6` Hook screen to `getProductsQueryOptions(tenantId)`.
  - Ref: main plan section `8.2`
- [x] `T3.7` Add primary buttons and dialogs shell (`products-primary-buttons.tsx`, `products-dialogs.tsx`).
  - Ref: main plan section `6.1`
- [x] `T3.8` Add `/products` entry to sidebar nav items list.
  - Find the nav items array in `src/components/layout/` (same location as `/categories` entry) and add the products link.
  - Ref: main plan section `6.2`
- [x] `T3.9` Regenerate route tree and verify `/products` loads.
  - Ref: main plan section `6.2`

Dependencies:

- `T3.6` depends on `T2.8`
- `T3.9` depends on `T3.1` and `T3.8`

---

## Phase 4 - Add Product Modal (Manual Input First)

- [x] `T4.1` Create `products-action-dialog.tsx` with dialog skeleton.
  - Ref: main plan section `6.1`, `7`
- [x] `T4.2` Add Zod form schema and default values.
  - Ref: main plan section `7.2`
- [x] `T4.3` Build top fields (`jan_code`, `product_name`).
  - Ref: main plan section `7.1`
- [x] `T4.4` Build dynamic units section (add/remove unit rows).
  - Each row must include `unit_name`, `sell_price`, `cost_price` (required, maps to NOT NULL column), `conversion_factor`.
  - Remove `Tên viết tắt` (short_name) — no DB column exists; field is deferred to Phase 2.
  - Ref: main plan section `7.1`
- [ ] `T4.5` Build details section (`description`, `status`, `min_stock`, `category_id`).
  - Ref: main plan section `7.1`
- [ ] `T4.6` Load category options from existing categories query.
  - Ref: main plan section `7.1`
- [ ] `T4.7` Implement submit mutation -> `productsRepo.createProductWithUnits`.
  - Ref: main plan section `7.4`
- [ ] `T4.8` Add pending/error/success UI behavior and query invalidation.
  - Ref: main plan section `7.4`

Dependencies:

- `T4.7` depends on `T2.4`
- `T4.8` depends on `T4.7`

---

## Phase 5 - Product Autocomplete + Autofill

- [ ] `T5.1` Add debounced input handler for product name (300-500ms).
  - Ref: main plan section `7.3`
- [ ] `T5.2` Query `productsRepo.searchByName` with current keyword and tenant scope.
  - Ref: main plan section `7.3`
- [ ] `T5.3` Render suggestion dropdown with keyboard/mouse selection.
  - Ref: main plan section `7.3`
- [ ] `T5.4` On selection, autofill product fields.
  - Ref: main plan section `7.3`
- [ ] `T5.5` Autofill first unit row if units empty.
  - Ref: main plan section `7.3`
- [ ] `T5.6` Apply existing `category_id` from selected product (if available).
  - Ref: main plan section `7.3`

Dependencies:

- `T5.2` depends on `T2.5`
- `T5.4` and `T5.5` depend on `T5.3`

---

## Phase 6 - QA and Stabilization

- [ ] `T6.1` Run lint and fix issues (`pnpm lint`).
  - Ref: main plan section `9.5`
- [ ] `T6.2` Run build and fix issues (`pnpm build`).
  - Ref: main plan section `9.5`
- [ ] `T6.3` Execute manual test script step-by-step.
  - Ref: main plan section `11`
- [ ] `T6.4` Verify Definition of Done checklist.
  - Ref: main plan section `13`

---

## Optional Phase 7 - Post-MVP Enhancements

- [ ] `T7.1` Add edit product flow.
  - Ref: main plan section `2.2`
- [ ] `T7.2` Add delete flow with dependency guardrails.
  - Ref: main plan section `2.2`, `10`
- [ ] `T7.3` Add filters for status/category/search.
  - Ref: main plan section `8`

---

## Suggested Commit Slices

- [ ] `C1` schema verification + repos + service exports + query options
- [ ] `C2` products route + list screen scaffold
- [ ] `C3` add product modal (manual create flow)
- [ ] `C4` autocomplete + autofill
- [ ] `C5` QA fixes

---

## Quick Progress Tracker

- Phase 0: `In Progress`
- Phase 1: `Done`
- Phase 2: `Done`
- Phase 3: `Done`
- Phase 4: `In Progress`
- Phase 5: `Not Started`
- Phase 6: `Not Started`
- Phase 7: `Optional`
