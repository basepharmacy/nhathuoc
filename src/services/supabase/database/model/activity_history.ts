import type { Tables } from '../../database.types'

// ─── Activity History ────────────────────────────────────────────────
export type ActivityHistory = Tables<'activity_history'>
export type ActivityHistoryWithRelations = ActivityHistory & {
	user?: { id: string; name: string } | null
	location?: { id: string; name: string } | null
}
export type ActivityHistoryQueryInput = {
	tenantId: string
	userId?: string | null
	locationId?: string | null
	pageIndex: number
	pageSize: number
	fromDate?: string | null
	toDate?: string | null
}

export type ActivityHistoryQueryResult = {
	data: ActivityHistoryWithRelations[]
	total: number
}
