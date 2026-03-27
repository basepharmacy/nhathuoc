import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

// ─── Bank Account ────────────────────────────────────────────────────
export type BankAccount = Tables<'bank_accounts'>
export type BankAccountInsert = TablesInsert<'bank_accounts'>
export type BankAccountUpdate = TablesUpdate<'bank_accounts'>
