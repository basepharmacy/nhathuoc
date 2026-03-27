import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

// ─── Location ────────────────────────────────────────────────────────
export type Location = Tables<'locations'>
export type LocationInsert = TablesInsert<'locations'>
export type LocationUpdate = TablesUpdate<'locations'>
