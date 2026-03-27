import type { StaffRole } from './profile'

// ─── User Account ────────────────────────────────────────────────────
export type CreateUserRequest = {
	email: string
	password: string
	name: string
	phone?: string
	address?: string
	location_id?: string
	description?: string
	role: StaffRole
	login_id?: string
}
