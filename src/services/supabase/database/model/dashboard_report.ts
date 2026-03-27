// ─── Dashboard Report ────────────────────────────────────────────────
export type SalesPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type PurchaseTopSupplier = {
	id: string
	name: string
	statValue: number
}

export type PurchasesStatisticsResult = {
	totalOrders: number
	totalOrderAmount: number
	totalPaidAmount: number
	totalDebt: number
}

export type PurchasesStatisticsV2Result = {
	totalOrders: number
	totalOrderAmount: number
	totalPaidAmount: number
	totalDebt: number
}

export type TopSupplierType = 'by_orders' | 'by_order_amount' | 'by_debt'

export type TopPurchasedProductType = 'by_orders' | 'by_order_amount'

export type PurchaseTopProduct = {
	id?: string
	name: string
	statValue: number
}

export type SalesTopProduct = {
	id?: string
	name: string
	unitName: string
	quantity: number
	revenue: number
	profit: number
}

export type TopCustomer = {
	id: string
	name: string
	phone: string
	quantity: number
	revenue: number
	profit: number
}

export type TopCustomerType = 'by_quantity' | 'by_revenue' | 'by_profit'

export type TopCategory = {
	id: string
	name: string
	quantity: number
	revenue: number
	profit: number
}

export type TopCategoryType = 'by_quantity' | 'by_revenue' | 'by_profit'

export type SalesTimeSeriesGroupBy = 'hour' | 'day' | 'day_of_week'

export type SalesTimeSeriesType = 'by_revenue' | 'by_order_count' | 'by_profit'

export type SalesTimeSeriesItem = {
	timeKey: number
	quantity: number
	revenue: number
	orderCount: number
	profit: number
}

export type SalesStatisticsResult = {
	revenue: number
	profit: number
	orders: number
	stockLossAmount: number
	revenueChange: number
	profitChange: number
	ordersChange: number
	stockLossChange: number
}

export type TopProductType = 'by_quantity' | 'by_revenue' | 'by_profit'

export type LowStockProduct = {
	name: string
	stock: number
	unitName: string
	minStock?: number
	status: 'out' | 'low'
}

export type ExpiredInventoryBatch = {
	id: string
	name: string
	batch: string
	expiredAt: string
	quantity: number
	unitName: string
}

export type CategoryByInventory = {
	id: string
	name: string
	quantity: number
	value: number
}

export type StaleBatch = {
	id: string
	name: string
	batch: string
	days: number
	quantity: number
	value: number
}

export type InventoryValueByMonth = {
	snapshotMonth: string
	totalImportQuantity: number
	totalExportQuantity: number
	totalQuantity: number
	totalImportValue: number
	totalExportValue: number
	totalInventoryValue: number
}

export type DeadValueInventoryItem = {
	productId: string
	productName: string
	productUnitName: string
	totalQuantity: number
	averageCostPrice: number
	totalInventoryValue: number
	lastSoldAt: string
}

export type PotentialLossInventoryItem = {
	batchId: string
	batchCode: string
	productId: string
	productName: string
	productUnitName: string
	quantity: number
	averageCostPrice: number
	expiryDate: string
	daysUntilExpiry: number
	avgDailySales: number
	sellableQuantity: number
	potentialLossQuantity: number
	potentialLossValue: number
}

export type LowStockInventoryItem = {
	productId: string
	productName: string
	productUnitName: string
	totalQuantity: number
	averageCostPrice: number
	totalInventoryValue: number
	avgDailySales: number
	estimatedDaysOfStock: number
}

export type QuickPurchaseOrderItem = {
	productId: string
	productName: string
	baseUnitName: string
	lastOrderUnitName: string
	lastOrderUnitId: string
	currentStock: number
	minStock: number
	avgDailySales: number
	estimatedDaysRemaining: number
	suggestedQuantity: number
	lastCostPrice: number
	estimatedCost: number
	supplierId: string
	supplierName: string
}

export type AdvanceSaleStatisticsResult = {
	returningCustomers: number
	returningCustomersChange: number
	profitMargin: number
	profitMarginChange: number
	returnRate: number
	returnRateChange: number
	avgSaleSpeed: number
	avgSaleSpeedChange: number
}

export type AdvancedPeriod = 'month' | 'quarter' | 'year'
