import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

// ─── Supplier ────────────────────────────────────────────────────────
export type Supplier = Tables<'suppliers'>
export type SupplierInsert = TablesInsert<'suppliers'>
export type SupplierUpdate = TablesUpdate<'suppliers'>
export type SupplierBankAccount = Tables<'supplier_bank_accounts'>
export type SupplierBankAccountInsert = TablesInsert<'supplier_bank_accounts'>
export type SupplierBankAccountUpdate = TablesUpdate<'supplier_bank_accounts'>
