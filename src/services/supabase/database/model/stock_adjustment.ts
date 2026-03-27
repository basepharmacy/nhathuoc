import type { Tables, TablesInsert } from '../../database.types'

// ─── Stock Adjustment ────────────────────────────────────────────────
export type StockAdjustment = Tables<'stock_adjustments'>
export type StockAdjustmentInsert = TablesInsert<'stock_adjustments'>
export type StockAdjustmentWithRelations = StockAdjustment & {
	products?: { id: string; product_name: string } | null
	locations?: { id: string; name: string } | null
}
export type StockAdjustmentsListQueryInput = {
	tenantId: string
	pageIndex: number
	pageSize: number
	search?: string
	locationId?: string
	reasonCodes?: StockAdjustment['reason_code'][]
	adjustmentTypes?: Array<'increase' | 'decrease'>
	fromDate?: string
	toDate?: string
}
export type StockAdjustmentsListQueryResult = {
	data: StockAdjustmentWithRelations[]
	total: number
}
