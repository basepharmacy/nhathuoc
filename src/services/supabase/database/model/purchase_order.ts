import type { Tables, TablesInsert, TablesUpdate, Enums } from '../../database.types'

// ─── Purchase Order ──────────────────────────────────────────────────
export type PurchaseOrder = Tables<'purchase_orders'>
export type PurchaseOrderInsert = TablesInsert<'purchase_orders'>
export type PurchaseOrderUpdate = TablesUpdate<'purchase_orders'>
export type PurchaseOrderStatus = Enums<'purchase_order_status'>
export type PurchaseOrderItem = Tables<'purchase_order_items'>
export type PurchaseOrderItemInsert = TablesInsert<'purchase_order_items'>
export type PurchaseOrderItemWithRelation = PurchaseOrderItem & {
	product: { id: string; product_name: string }
	product_unit: { id: string; unit_name: string } | null
}
export type PurchaseOrderDetailWithRelations = PurchaseOrder & {
	items: PurchaseOrderItemWithRelation[]
	supplier?: { id: string; name: string } | null
	location?: { id: string; name: string; address?: string | null; phone?: string | null } | null
	user?: { id: string; name: string } | null
}
export type PurchaseOrderWithRelations = PurchaseOrder & {
	supplier?: { id: string; name: string } | null
	location?: { id: string; name: string } | null
	user?: { id: string; name: string } | null
}
export type PurchaseOrderWithItems = PurchaseOrder & {
	items?: PurchaseOrderItem[]
}
export type PurchaseOrdersHistoryQueryInput = {
	tenantId: string
	pageIndex: number
	pageSize: number
	search?: string
	supplierId?: string
	locationId?: string
	statuses?: Array<PurchaseOrder['status']>
	paymentStatuses?: Array<PurchaseOrder['payment_status']>
	fromDate?: string
	toDate?: string
	purchasePeriodId?: number
	sorting?: Array<{ id: string; desc: boolean }>
}
export type PurchaseOrdersHistoryQueryResult = {
	data: PurchaseOrderWithRelations[]
	total: number
}
