import { type InventoryBatch } from '@/services/supabase/'
import { isItemOverStock } from '../data/inventory-helpers'
import { type SaleOrderState } from './sale-order-store'

export const selectBatchesByProductId = (state: SaleOrderState) => {
  const filtered = state.inventoryBatches.filter(
    (batch) => batch.location_id === state.selectedLocationId
  )
  return filtered.reduce<Record<string, InventoryBatch[]>>((acc, batch) => {
    if (!acc[batch.product_id]) acc[batch.product_id] = []
    acc[batch.product_id].push(batch)
    return acc
  }, {})
}

// Làm tròn TỪNG DÒNG rồi mới cộng, khớp với thành tiền hiển thị và hoá đơn in.
// `sale_orders.total_amount` là integer nên tổng bắt buộc phải nguyên.
export const selectSubtotal = (state: SaleOrderState) =>
  state.items.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPrice), 0)

export const selectTotal = (state: SaleOrderState) =>
  Math.max(0, selectSubtotal(state) - state.orderDiscount)

export const selectIsEdit = (state: SaleOrderState) =>
  Boolean(state.initialData.id)

/** Đơn có ít nhất 1 dòng vượt tồn kho → chỉ được lưu nháp, không hoàn tất được. */
export const selectHasOverStockItem = (state: SaleOrderState) =>
  state.items.some(isItemOverStock)
