import type { QuickPurchaseOrderItem, PurchasesStatisticsV2Result, LowStockInventoryItem } from '@/services/supabase/database/model'

export const DUMMY_PURCHASE_STATISTICS: PurchasesStatisticsV2Result = {
  totalOrders: 48,
  totalOrderAmount: 125000000,
  totalPaidAmount: 98000000,
  totalDebt: 27000000,
}

export const DUMMY_TOP_SUPPLIERS = [
  { id: 's1', name: 'Công ty TNHH Dược phẩm Hà Nội', statValue: 45000000 },
  { id: 's2', name: 'NCC Thiên Nhiên Pharma', statValue: 32000000 },
  { id: 's3', name: 'Đại lý thuốc Minh Tâm', statValue: 25000000 },
  { id: 's4', name: 'Công ty CP Dược Sài Gòn', statValue: 15000000 },
  { id: 's5', name: 'NCC khác', statValue: 8000000 },
]

export const DUMMY_LOW_STOCK_PURCHASE: LowStockInventoryItem[] = [
  { productId: 'p4', productName: 'Panadol Extra', productUnitName: 'vỉ', totalQuantity: 12, avgDailySales: 3.5, estimatedDaysOfStock: 3.4, averageCostPrice: 25000, totalInventoryValue: 300000 },
  { productId: 'p5', productName: 'Efferalgan 500mg', productUnitName: 'vỉ', totalQuantity: 20, avgDailySales: 2.8, estimatedDaysOfStock: 7.1, averageCostPrice: 18000, totalInventoryValue: 360000 },
  { productId: 'p6', productName: 'Amoxicillin 500mg', productUnitName: 'vỉ', totalQuantity: 35, avgDailySales: 2.2, estimatedDaysOfStock: 15.9, averageCostPrice: 22000, totalInventoryValue: 770000 },
]

export const DUMMY_QUICK_ORDERS: QuickPurchaseOrderItem[] = [
  { productId: 'p4', productName: 'Panadol Extra', baseUnitName: 'viên', lastOrderUnitName: 'hộp', lastOrderUnitId: 'u1', currentStock: 12, minStock: 50, avgDailySales: 3.5, estimatedDaysRemaining: 3.4, suggestedQuantity: 5, lastCostPrice: 85000, estimatedCost: 425000, supplierId: 's1', supplierName: 'Công ty TNHH Dược phẩm Hà Nội' },
  { productId: 'p5', productName: 'Efferalgan 500mg', baseUnitName: 'viên', lastOrderUnitName: 'hộp', lastOrderUnitId: 'u2', currentStock: 20, minStock: 60, avgDailySales: 2.8, estimatedDaysRemaining: 7.1, suggestedQuantity: 4, lastCostPrice: 65000, estimatedCost: 260000, supplierId: 's1', supplierName: 'Công ty TNHH Dược phẩm Hà Nội' },
  { productId: 'p7', productName: 'Vitamin C DHG', baseUnitName: 'viên', lastOrderUnitName: 'lọ', lastOrderUnitId: 'u3', currentStock: 15, minStock: 40, avgDailySales: 2.0, estimatedDaysRemaining: 7.5, suggestedQuantity: 3, lastCostPrice: 45000, estimatedCost: 135000, supplierId: 's2', supplierName: 'NCC Thiên Nhiên Pharma' },
]
