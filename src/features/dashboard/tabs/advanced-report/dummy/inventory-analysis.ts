import type {
  DeadValueInventoryItem,
  PotentialLossInventoryItem,
  LowStockInventoryItem,
  InventoryValueByMonth,
} from '@/services/supabase/database/repo/dashboardReportRepo'

export const DUMMY_FLOW_DATA: InventoryValueByMonth[] = [
  { snapshotMonth: '2025-04', totalImportQuantity: 320, totalExportQuantity: 280, totalQuantity: 12100, totalImportValue: 256000000, totalExportValue: 224000000, totalInventoryValue: 1720000000 },
  { snapshotMonth: '2025-05', totalImportQuantity: 450, totalExportQuantity: 390, totalQuantity: 12160, totalImportValue: 360000000, totalExportValue: 312000000, totalInventoryValue: 1768000000 },
  { snapshotMonth: '2025-06', totalImportQuantity: 380, totalExportQuantity: 420, totalQuantity: 12120, totalImportValue: 304000000, totalExportValue: 336000000, totalInventoryValue: 1736000000 },
  { snapshotMonth: '2025-07', totalImportQuantity: 520, totalExportQuantity: 480, totalQuantity: 12160, totalImportValue: 416000000, totalExportValue: 384000000, totalInventoryValue: 1768000000 },
  { snapshotMonth: '2025-08', totalImportQuantity: 410, totalExportQuantity: 350, totalQuantity: 12220, totalImportValue: 328000000, totalExportValue: 280000000, totalInventoryValue: 1816000000 },
  { snapshotMonth: '2025-09', totalImportQuantity: 350, totalExportQuantity: 400, totalQuantity: 12170, totalImportValue: 280000000, totalExportValue: 320000000, totalInventoryValue: 1776000000 },
  { snapshotMonth: '2025-10', totalImportQuantity: 480, totalExportQuantity: 510, totalQuantity: 12140, totalImportValue: 384000000, totalExportValue: 408000000, totalInventoryValue: 1752000000 },
  { snapshotMonth: '2025-11', totalImportQuantity: 550, totalExportQuantity: 490, totalQuantity: 12200, totalImportValue: 440000000, totalExportValue: 392000000, totalInventoryValue: 1800000000 },
  { snapshotMonth: '2025-12', totalImportQuantity: 420, totalExportQuantity: 380, totalQuantity: 12240, totalImportValue: 336000000, totalExportValue: 304000000, totalInventoryValue: 1832000000 },
  { snapshotMonth: '2026-01', totalImportQuantity: 390, totalExportQuantity: 430, totalQuantity: 12200, totalImportValue: 312000000, totalExportValue: 344000000, totalInventoryValue: 1800000000 },
  { snapshotMonth: '2026-02', totalImportQuantity: 510, totalExportQuantity: 460, totalQuantity: 12250, totalImportValue: 408000000, totalExportValue: 368000000, totalInventoryValue: 1840000000 },
  { snapshotMonth: '2026-03', totalImportQuantity: 600, totalExportQuantity: 400, totalQuantity: 12450, totalImportValue: 480000000, totalExportValue: 320000000, totalInventoryValue: 1850000000 },
]

export const DUMMY_DEAD_VALUE: DeadValueInventoryItem[] = [
  { productId: 'p1', productName: 'Kem chống nắng SPF50', productUnitName: 'tuýp', totalQuantity: 45, averageCostPrice: 120000, totalInventoryValue: 5400000, lastSoldAt: '2025-12-15' },
  { productId: 'p2', productName: 'Nước súc miệng Listerine', productUnitName: 'chai', totalQuantity: 30, averageCostPrice: 85000, totalInventoryValue: 2550000, lastSoldAt: '2025-11-20' },
  { productId: 'p3', productName: 'Bông tẩy trang', productUnitName: 'gói', totalQuantity: 60, averageCostPrice: 35000, totalInventoryValue: 2100000, lastSoldAt: '2025-10-05' },
]

export const DUMMY_POTENTIAL_LOSS: PotentialLossInventoryItem[] = [
  { batchId: 'b1', productId: 'p10', productName: 'Vitamin E 400IU', productUnitName: 'viên', batchCode: 'VE-2025-01', quantity: 200, averageCostPrice: 15000, expiryDate: '2026-04-15', daysUntilExpiry: 19, avgDailySales: 5, sellableQuantity: 95, potentialLossQuantity: 105, potentialLossValue: 3000000 },
  { batchId: 'b2', productId: 'p11', productName: 'Siro ho Prospan', productUnitName: 'chai', batchCode: 'PS-2024-08', quantity: 15, averageCostPrice: 120000, expiryDate: '2026-04-25', daysUntilExpiry: 29, avgDailySales: 0.3, sellableQuantity: 9, potentialLossQuantity: 6, potentialLossValue: 1800000 },
  { batchId: 'b3', productId: 'p12', productName: 'Thuốc nhỏ mắt Rohto', productUnitName: 'lọ', batchCode: 'RT-2025-03', quantity: 40, averageCostPrice: 30000, expiryDate: '2026-05-10', daysUntilExpiry: 44, avgDailySales: 0.5, sellableQuantity: 22, potentialLossQuantity: 18, potentialLossValue: 1200000 },
]

export const DUMMY_LOW_STOCK: LowStockInventoryItem[] = [
  { productId: 'p4', productName: 'Panadol Extra', productUnitName: 'vỉ', totalQuantity: 12, avgDailySales: 3.5, estimatedDaysOfStock: 3.4, averageCostPrice: 25000, totalInventoryValue: 300000 },
  { productId: 'p5', productName: 'Efferalgan 500mg', productUnitName: 'vỉ', totalQuantity: 20, avgDailySales: 2.8, estimatedDaysOfStock: 7.1, averageCostPrice: 18000, totalInventoryValue: 360000 },
  { productId: 'p6', productName: 'Amoxicillin 500mg', productUnitName: 'vỉ', totalQuantity: 35, avgDailySales: 2.2, estimatedDaysOfStock: 15.9, averageCostPrice: 22000, totalInventoryValue: 770000 },
]

export const DUMMY_CATEGORIES_INV = [
  { id: '1', name: 'Thuốc kê đơn', quantity: 2500, value: 450000000 },
  { id: '2', name: 'Thuốc không kê đơn', quantity: 1800, value: 280000000 },
  { id: '3', name: 'Thực phẩm chức năng', quantity: 900, value: 180000000 },
  { id: '4', name: 'Dụng cụ y tế', quantity: 400, value: 95000000 },
  { id: '5', name: 'Mỹ phẩm', quantity: 300, value: 65000000 },
]

export const DUMMY_STALE_BATCHES = [
  { name: 'Kem nghệ Thái Dương', batch: 'KN-2024-01', days: 180, quantity: 50, value: 2500000 },
  { name: 'Dầu gội dược liệu', batch: 'DG-2024-03', days: 150, quantity: 35, value: 1750000 },
  { name: 'Sữa rửa mặt Cetaphil', batch: 'SR-2024-05', days: 120, quantity: 25, value: 1875000 },
  { name: 'Bông tẩy trang', batch: 'BT-2024-02', days: 110, quantity: 80, value: 2800000 },
  { name: 'Nước muối sinh lý', batch: 'NM-2024-06', days: 95, quantity: 100, value: 1500000 },
  { name: 'Băng cá nhân', batch: 'BC-2024-04', days: 85, quantity: 200, value: 600000 },
]
