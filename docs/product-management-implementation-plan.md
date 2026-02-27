# Product Management Implementation Plan

## 1. Goal

Implement Product Management feature and Add Product modal based on:

- `specs/design.svg`
- `specs/note.txt`
- `docs/supabase-rules.md`
- `src/services/supabase/database.types.ts`

This document is a step-by-step execution plan intended to be reused later without extra context gathering.

---

## 2. Functional Scope

### 2.1 Must-have (Phase 1)

- New route: `/products`
- Product list screen for current tenant
- Add Product modal with:
  - `Mã Jancode` (optional)
  - `Tên sản phẩm` (required)
  - Dynamic unit rows (`Đơn vị`, `Giá bán`, `Giá vốn`, `số lượng quy đổi`)
  - Product details (`Mô tả`, `Tình trạng`, `Ngưỡng cảnh báo tồn kho`, `Danh mục`)
  - Note: `Tên viết tắt` is deferred out of current scope — no `short_name` column exists in `products`
- Save to DB using `products` + `product_units`
- Product name autocomplete using existing `products` (tenant-scoped)
- Autofill when an existing product item is selected

### 2.2 Required Enhancements (Phase 7 - In Scope Now)

- Edit product modal
- Delete product action with guardrails
- Better table filters (status, category, keyword)

> Execution note: Phase 6 QA/stabilization is intentionally deferred and will be completed after Phase 7 delivery.

---

## 3. Architecture Rules (Non-negotiable)

From `docs/supabase-rules.md`, enforce:

1. Supabase data access only in `src/services/supabase/database/repo/*.ts`
2. Type aliases only in `src/services/supabase/database/model/index.ts`
3. Shared helpers only in `src/services/supabase/database/utils/index.ts`
4. Every repo method:
   - explicit input/output types
   - `if (error) throw error`
   - stable return shape
5. UI layer must never call raw `client.from(...)`

---

## 4. Data Model Plan

## 4.1 Existing tables to use

- `products` — **already exists in DB and generated types**
- `product_units` — **already exists in DB and generated types**
- `categories` — **already exists in DB and generated types**

No migration is needed for these tables.

## 4.2 New table requirement

No new table is required. Use existing `products` + `product_units` + `categories` only.

## 4.3 Type generation

No type regeneration is required for this feature scope unless upstream schema changes are made outside this repo.

---

## 5. Service Layer Implementation Plan

## 5.1 Model aliases

Convention (matches existing pattern in `categoriesRepo.ts`):
- Define types **inside the repo file** using `Tables<'...'>`, `TablesInsert<'...'>`, `TablesUpdate<'...'>`.
- Re-export from `src/services/supabase/database/model/index.ts` via `export * from '../repo/productsRepo'` etc.
- Do NOT add `Tables<...>` aliases directly in `model/index.ts`.

Types to define in `productsRepo.ts`:
- `Product`, `ProductInsert`, `ProductUpdate`
- `ProductUnit`, `ProductUnitInsert`, `ProductUnitUpdate`
- `ProductWithMeta` (see section 5.2)

Then add to `model/index.ts`:
```ts
export * from '../repo/productsRepo'
```

## 5.2 New repository: `productsRepo.ts`

File: `src/services/supabase/database/repo/productsRepo.ts`

Factory pattern:

```ts
export const createProductsRepository = (client: BasePharmacySupabaseClient) => ({ ... })
```

Methods for Phase 1:

1. `getProductsByTenantId(tenantId: string): Promise<ProductWithMeta[]>`
2. `createProductWithUnits(input: CreateProductWithUnitsInput): Promise<CreateProductWithUnitsResult>`

Additional methods for required Phase 7:

3. `updateProductWithUnits(input: UpdateProductWithUnitsInput): Promise<CreateProductWithUnitsResult>`
4. `deleteProductById(tenantId: string, productId: string): Promise<void>`

`ProductWithMeta` definition (join products + product_units + category name):

```ts
export type ProductWithMeta = Product & {
  product_units: ProductUnit[]
  categories: { name: string } | null
}
```

Query must use `.select('*, product_units(*), categories(name)')` and order by `created_at desc`.

### 5.2.1 Suggested input/output types

```ts
type CreateProductUnitInput = {
  unit_name: string
  sell_price: number
  conversion_factor: number
  cost_price: number  // required — product_units.cost_price is NOT NULL in DB with no default
}

type CreateProductWithUnitsInput = {
  tenant_id: string
  product: {
    product_name: string
    jan_code?: string | null
    description?: string | null
    category_id?: string | null
    min_stock?: number | null
    status?: Enums<'product_status'>
  }
  units: CreateProductUnitInput[]
}

type CreateProductWithUnitsResult = {
  product: Product
  units: ProductUnit[]
}
```

### 5.2.2 Implementation notes

- Validate `units.length > 0` before insert.
- Insert into `products` first, then bulk insert into `product_units`.
- If bulk insert fails, throw error immediately.
- Keep return shape always `{ product, units }`.

## 5.3 Autocomplete query source

Use `productsRepo` as the autocomplete data source.

Recommended method:

1. `searchByName(tenantId: string, keyword: string, limit = 10): Promise<ProductWithMeta[]>`

Query strategy:

- Scope by `tenant_id`.
- Use `ilike('%keyword%')` for initial version.
- Add deterministic ordering (`product_name` asc).

## 5.4 Export wiring

Update:

- `src/services/supabase/index.ts`
- `src/client/index.ts`
- `src/client/queries.ts`

Add:

- `productsRepo`
- query options:
  - `getProductsQueryOptions(tenantId)`

Autocomplete strategy: call `productsRepo.searchByName` directly inside a debounced handler — do NOT use `useQuery` for typeahead. This avoids stale cache and caching issues for fast-changing keyword input.

---

## 6. Frontend Feature Plan

## 6.1 Folder structure

Create:

- `src/features/products/index.tsx`
- `src/features/products/data/schema.ts`
- `src/features/products/components/products-provider.tsx`
- `src/features/products/components/products-table.tsx`
- `src/features/products/components/products-columns.tsx`
- `src/features/products/components/products-primary-buttons.tsx`
- `src/features/products/components/products-dialogs.tsx`
- `src/features/products/components/products-action-dialog.tsx`

Pattern: mirror `features/categories` for consistency and minimal risk.

## 6.2 Route registration

Create:

- `src/routes/_authenticated/products/index.tsx`

Then run route generation command (project standard) so `routeTree.gen.ts` includes `/products`.

Also add the sidebar nav entry so the link appears in the app navigation. Find the nav items list in `src/components/layout/` (look for where `/categories` is linked) and add a `/products` entry alongside it.

---

## 7. Add Product Modal Detailed Behavior

## 7.1 Form fields mapping

Top section:

- `jan_code` -> `products.jan_code`
- `product_name` -> `products.product_name` (required)

Units section (repeatable rows):

- `unit_name` -> `product_units.unit_name` (required)
- `sell_price` -> `product_units.sell_price` (required, `>= 0`)
- `conversion_factor` -> `product_units.conversion_factor` (required, `> 0`)
- optional `cost_price` if needed later

Details section:

- `description` -> `products.description`
- `status` -> `products.status`
- `min_stock` -> `products.min_stock`
- `category_id` -> `products.category_id`

## 7.2 Validation rules (zod)

```ts
product_name: string().min(1)
jan_code: string().optional()
status: enum(product_status).default('2_ACTIVE')
min_stock: number().int().nonnegative().nullable()
category_id: string().uuid().nullable()
units: array(
  object({
    unit_name: string().min(1),
    sell_price: number().nonnegative(),
    cost_price: number().nonnegative(),  // required — maps to product_units.cost_price NOT NULL
    conversion_factor: number().positive(),
  })
).min(1)
```

## 7.3 Product autocomplete flow

1. User types in `Tên sản phẩm`
2. Debounce 300-500ms
3. Call `productsRepo.searchByName(tenantId, keyword, 10)`
4. Show suggestion dropdown
5. On select suggestion (existing product):
   - fill product fields:
     - `product_name`
     - `jan_code`
     - `description`
     - `status` (if mapped)
     - `min_stock`
   - fill first unit row if no units exist:
     - `unit_name`
     - `sell_price`
     - `conversion_factor`
   - use existing `category_id` directly

## 7.4 Submit flow

1. Disable submit button while pending
2. Call `productsRepo.createProductWithUnits`
3. On success:
   - invalidate `['products', tenantId]`
   - close modal
   - reset form
4. On error:
   - show destructive alert
   - keep user input untouched

---

## 8. Product List Screen Plan

## 8.1 Columns

Suggested minimum columns:

- Product name
- Jan code
- Category
- Status
- Min stock
- Units summary (ex: `Viên, Vỉ`)
- Created at
- Row actions (`Edit`, `Delete`)

## 8.2 Query behavior

- Fetch by tenant from `getProductsQueryOptions(tenantId)`
- Deterministic sort (newest first or name asc)
- Loading and empty states in Vietnamese

---

## 9. File-by-File Task Checklist

## 9.1 Database and typing

- [ ] Verify `products`, `product_units`, `categories` exist in `database.types.ts`
- [ ] Confirm no new migration is required for this scope

## 9.2 Supabase layer

- [ ] Update `src/services/supabase/database/model/index.ts`
- [ ] Create `src/services/supabase/database/repo/productsRepo.ts`
- [ ] Export repos in `src/services/supabase/index.ts`
- [ ] Instantiate repos in `src/client/index.ts`
- [ ] Add query options in `src/client/queries.ts`

## 9.3 UI feature

- [ ] Create `src/features/products/**` files
- [ ] Create route `src/routes/_authenticated/products/index.tsx`
- [ ] Add `/products` entry to sidebar nav items list
- [ ] Generate route tree
- [ ] Confirm sidebar link `/products` navigates correctly

## 9.4 Modal behavior

- [ ] Form schema and default values
- [ ] Dynamic units list UI
- [ ] Autocomplete + debounce
- [ ] Autofill from selected existing product
- [ ] Submit + query invalidation
- [ ] Error handling and loading state

## 9.5 QA and build

- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Manual flow checks (see section 11)

## 9.6 Required Phase 7 enhancements

- [ ] Add repo methods for edit/delete with explicit error handling and stable return shape
- [ ] Add edit flow UI + mutation + invalidation
- [ ] Add delete flow UI + guardrail checks + mutation + invalidation
- [ ] Add list filters (status/category/keyword) + clear filters behavior

## 9.7 Deferred QA gate (run after phase 7)

- [ ] Execute full lint/build/manual checks after completing phase 7 enhancements

---

## 10. Risk Register and Mitigations

1. Risk: No transaction across `products` + `product_units`
   - Mitigation: keep strict insert order and fail fast; add RPC transaction later if needed.
2. Risk: Autofill may apply outdated values from previously created products
   - Mitigation: keep all autofilled fields editable before submit.
3. Risk: Duplicate products by same name
   - Mitigation: optional duplicate warning in UI before submit.
4. Risk: Search performance in `products` for large tenant datasets
   - Mitigation: tenant scoping, limit, and optional DB index tuning later.

---

## 11. Manual Test Script

1. Open `/products`
2. Click `Thêm sản phẩm`
3. Type name matching an existing `products` row in the same tenant
4. Select suggestion and verify autofill
5. Add second unit row (`Vỉ`) with conversion factor
6. Submit
7. Verify:
   - New row appears in list
   - DB has one `products` row and N `product_units` rows
8. Retry with invalid data:
   - empty product name
   - negative sell price
   - zero conversion factor
   - expect client validation errors
9. Retry with API error simulation:
   - expect modal remains open and error message displayed
10. Open row action `Edit`, update product fields + units, submit
11. Verify edited row data is updated in list and persisted in DB
12. Open row action `Delete` for product without guarded dependencies, confirm delete
13. Verify deleted row no longer appears in list
14. Attempt delete for product with guarded dependencies
15. Verify delete is blocked with clear error message and row remains
16. Apply filters by status, category, and keyword (alone + combined)
17. Verify filtered results are correct and clear/reset filters restores full list

---

## 12. Implementation Order (Exact)

1. Validate existing schema/types (`products`, `product_units`, `categories`)
2. Implement `productsRepo`
3. Wire exports and query options
4. Scaffold `/products` page with list table (read-only)
5. Implement Add Product modal (manual input first)
6. Add autocomplete + autofill
7. Implement required enhancements: edit + delete (guardrails) + filters
8. Run manual tests for create/edit/delete/filter flows
9. Run Phase 6 QA gate (`pnpm lint`, `pnpm build`) later as stabilization pass

---

## 13. Definition of Done

- `/products` route is accessible and stable
- User can create product with at least one unit
- User can edit product and units from row actions
- User can delete product with dependency guardrails enforced
- User can filter list by status/category/keyword and clear filters
- Product name search hits tenant-scoped `products`
- Selecting existing product autofills form
- Data is persisted correctly in `products` and `product_units`
- No raw Supabase calls in UI/components/routes
- Lint/build pass
