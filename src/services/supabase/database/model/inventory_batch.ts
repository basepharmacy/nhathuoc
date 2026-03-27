import type { Tables, TablesInsert } from '../../database.types'
import type { ProductStatus } from './product'

// ─── Inventory Batch ─────────────────────────────────────────────────
export type InventoryBatch = Tables<'inventory_batches'>
export type InventoryBatchInsert = TablesInsert<'inventory_batches'>

export type InventoryBatchStockStatus = 'in_stock' | 'out_of_stock'
export type InventoryBatchExpiryStatus = 'expired' | '7_days' | '1_month' | '3_months'

export type InventoryBatchSortField = 'expiry_date' | 'quantity' | 'cumulative_quantity' | 'average_cost_price'

export type InventoryBatchesListQueryInput = {
	tenantId: string
	pageIndex: number
	pageSize: number
	search?: string
	locationId?: string
	stockStatus?: InventoryBatchStockStatus
	expiryStatus?: InventoryBatchExpiryStatus
	sortBy?: InventoryBatchSortField
	sortOrder?: 'asc' | 'desc'
}

export type InventoryBatchProductUnit = {
	unit_name: string
	is_base_unit: boolean
	conversion_factor: number
}

export type InventoryBatchWithRelations = {
	id: string
	batch_code: string
	product_id: string
	location_id: string
	tenant_id: string
	quantity: number
	cumulative_quantity: number
	average_cost_price: number
	expiry_date: string
	created_at: string
	updated_at: string
	product_name: string
	product_status: ProductStatus
	product_units: InventoryBatchProductUnit[]
	location_name: string
	total: number
}

export type InventoryBatchesListQueryResult = {
	data: InventoryBatchWithRelations[]
	total: number
}

export type InventoryBatchesSummaryQueryInput = {
	tenantId: string
	search?: string
	locationId?: string
}

export type InventoryBatchesSummary = {
	totalBatches: number
	totalProducts: number
	totalQuantity: number
	totalValue: number
}

export type InventoryProductSortField = 'nearest_expiry_date' | 'quantity' | 'cumulative_quantity' | 'average_cost_price' | 'batch_numbers'

export type InventoryProductsListQueryInput = {
	tenantId: string
	pageIndex: number
	pageSize: number
	search?: string
	locationId?: string
	stockStatus?: InventoryBatchStockStatus
	expiryStatus?: InventoryBatchExpiryStatus
	sortBy?: InventoryProductSortField
	sortOrder?: 'asc' | 'desc'
}

export type InventoryProductsListItem = {
	id: string
	product_name: string
	product_status: ProductStatus
	quantity: number
	cumulative_quantity: number
	average_cost_price: number
	batch_numbers: number
	location_id: string
	location_name: string
	nearest_expiry_date: string
	product_units: InventoryBatchProductUnit[]
	tenant_id: string
	created_at: string
	updated_at: string
	total: number
}

export type InventoryProductsListQueryResult = {
	data: InventoryProductsListItem[]
	total: number
}
