import type { Tables, TablesInsert, TablesUpdate, Enums } from '../../database.types'
import type { Tenant } from './tenant'
import type { Location } from './location'

// ─── Profile ─────────────────────────────────────────────────────────
export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>
export type ProfileWithRelations = Profile & {
	tenant?: Tenant | null
	location?: Location | null
}
export type StaffRole = Enums<'staff_role'>
