import type { Tables, TablesInsert, TablesUpdate, Enums } from '../../database.types'

// ─── Product ─────────────────────────────────────────────────────────
export type Product = Tables<'products'>
export type ProductInsert = TablesInsert<'products'>
export type ProductUpdate = TablesUpdate<'products'>
export type ProductStatus = Enums<'product_status'>
export type ProductUnit = Tables<'product_units'>
export type ProductUnitInsert = TablesInsert<'product_units'>
export type ProductUnitUpdate = TablesUpdate<'product_units'>
export type ProductWithUnits = Product & { product_units?: ProductUnit[] }

// ─── Đổi đơn vị cơ bản (RPC rebase_product_base_unit) ────────────────
export type RebaseProductBaseUnitResult = {
  new_unit_id: string
  new_unit_name: string
  old_base_unit_name: string
  factor: number
  affected_batches: number
  affected_adjustments: number
}

// ─── Thống kê giao dịch theo đơn vị (RPC get_product_unit_usage) ─────
export type ProductUnitUsage = {
  product_unit_id: string
  sale_count: number
  purchase_count: number
}
