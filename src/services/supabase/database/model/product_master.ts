import type { Tables } from '../../database.types'

// ─── Product Master ──────────────────────────────────────────────────
export type ProductMaster = Tables<'product_masters'>
export type ProductMasterUnit = Tables<'product_master_units'>
export type ProductMasterWithUnits = ProductMaster & {
	product_master_units: ProductMasterUnit[]
}
