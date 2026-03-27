import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

// ─── Category ────────────────────────────────────────────────────────
export type Category = Tables<'categories'>
export type CategoryInsert = TablesInsert<'categories'>
export type CategoryUpdate = TablesUpdate<'categories'>
export type CategoryWithActiveProductsCount = Category & {
	active_products_count: number
}
