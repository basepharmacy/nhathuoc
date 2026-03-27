import type { Tables, TablesInsert } from '../../database.types'

// ─── Supplier Payment ────────────────────────────────────────────────
export type SupplierPayment = Tables<'supplier_payments'>
export type SupplierPaymentInsert = TablesInsert<'supplier_payments'>
export type SupplierPaymentWithSupplier = SupplierPayment & {
	supplier: { id: string; name: string } | null
}
export type SupplierPaymentsHistoryQueryInput = {
	tenantId: string
	supplierId: string
	pageIndex: number
	pageSize: number
	search?: string
	fromDate?: string
	toDate?: string
	purchasePeriodId?: number
	sorting?: Array<{ id: string; desc: boolean }>
}
export type SupplierPaymentsHistoryQueryResult = {
	data: SupplierPaymentWithSupplier[]
	total: number
}
export type AllSupplierPaymentsHistoryQueryInput = {
	tenantId: string
	pageIndex: number
	pageSize: number
	search?: string
	supplierIds?: string[]
	fromDate?: string
	toDate?: string
	purchasePeriodId?: number
	sorting?: Array<{ id: string; desc: boolean }>
}
export type AllSupplierPaymentsHistoryQueryResult = {
	data: SupplierPaymentWithSupplier[]
	total: number
}
