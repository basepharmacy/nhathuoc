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
