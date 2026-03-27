import type { Tables, TablesInsert, TablesUpdate, Enums } from '../../database.types'

// ─── Sale Order ──────────────────────────────────────────────────────
export type SaleOrder = Tables<'sale_orders'>
export type SaleOrderInsert = TablesInsert<'sale_orders'>
export type SaleOrderUpdate = TablesUpdate<'sale_orders'>
export type SaleOrderStatus = Enums<'sale_order_status'>
export type SaleOrderItem = Tables<'sale_order_items'>
export type SaleOrderItemInsert = TablesInsert<'sale_order_items'>
export type SaleOrderItemWithRelation = SaleOrderItem & {
	batch: {
		id: string
		batch_code: string
		expiry_date: string
		quantity: number
		average_cost: number
	}
	product: { id: string; product_name: string }
	product_unit: { id: string; unit_name: string }
}
export type SaleOrderWithRelations = SaleOrder & {
	items: SaleOrderItemWithRelation[]
	customer?: { id: string; name: string } | null
	location?: { id: string; name: string; address?: string | null; phone?: string | null } | null
	user?: { id: string; name: string } | null
}
export type SaleOrderWithItems = SaleOrder & {
	items?: SaleOrderItem[]
}
export type SaleOrdersHistoryQueryInput = {
	tenantId: string
	pageIndex: number
	pageSize: number
	search?: string
	customerId?: string
	locationId?: string
	statuses?: Array<SaleOrder['status']>
	fromDate?: string
	toDate?: string
	sorting?: Array<{ id: string; desc: boolean }>
}
export type SaleOrdersHistoryQueryResult = {
	data: SaleOrderWithRelations[]
	total: number
}
