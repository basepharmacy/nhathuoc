import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

// ─── Customer ────────────────────────────────────────────────────────
export type Customer = Tables<'customers'>
export type CustomerInsert = TablesInsert<'customers'>
export type CustomerUpdate = TablesUpdate<'customers'>
