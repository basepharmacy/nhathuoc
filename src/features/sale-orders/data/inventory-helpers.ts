import { type InventoryBatch, ProductWithUnits } from '@/services/supabase/'
import { type SaleOrderItem } from './types'

export const getBatchQuantity = (batch: InventoryBatch) => batch.quantity ?? 0

/** Return the conversion factor for an item's currently-selected unit (defaults to 1 for base unit). */
export const getItemConversionFactor = (item: SaleOrderItem): number => {
  const unit = item.product.product_units?.find((u) => u.id === item.productUnitId)
  return unit?.conversion_factor || 1
}

export const getAllocatedByBatch = (productId: string, rows: SaleOrderItem[]) => {
  const map = new Map<string, number>()
  rows.forEach((row) => {
    if (row.product.id !== productId) return
    if (!row.batchId) return
    map.set(row.batchId, (map.get(row.batchId) ?? 0) + row.quantity)
  })
  return map
}

export const getNextAvailableBatch = (
  batches: InventoryBatch[],
  allocations: Map<string, number>
) => {
  return (
    batches.find((batch) => {
      const available = getBatchQuantity(batch) - (allocations.get(batch.id) ?? 0)
      return available > 0
    }) ?? null
  )
}

/**
 * Lô dùng khi sản phẩm đã hết tồn: ưu tiên lô chưa có dòng nào trong đơn dùng tới,
 * nếu hết thì lấy lô đầu tiên. Luôn trả về một lô có thật vì
 * `sale_order_items.batch_id` là NOT NULL.
 */
export const getFallbackBatch = (
  batches: InventoryBatch[],
  rows: SaleOrderItem[],
  productId: string
): InventoryBatch | null => {
  if (batches.length === 0) return null
  const usedBatchIds = new Set(
    rows.filter((row) => row.product.id === productId).map((row) => row.batchId)
  )
  return batches.find((batch) => !usedBatchIds.has(batch.id)) ?? batches[0]
}

/** Dòng đang bán vượt tồn kho của lô đang chọn (gồm cả trường hợp lô đã hết sạch). */
export const isItemOverStock = (item: SaleOrderItem) => item.quantity > item.stock

/**
 * FIFO batch allocation: distributes a desired quantity across inventory batches,
 * starting from the current batch and spilling over to subsequent batches.
 */
export const allocateQuantityToBatches = ({
  target,
  desired,
  batches,
  allItems,
  conversionFactor = 1,
  allowOverStock = false,
}: {
  target: SaleOrderItem
  desired: number
  batches: InventoryBatch[]
  allItems: SaleOrderItem[]
  /** Conversion factor of the target item's selected unit (base unit = 1). */
  conversionFactor?: number
  /** Cho phép giữ số lượng vượt tồn kho trên dòng target thay vì cắt bớt. */
  allowOverStock?: boolean
}): SaleOrderItem[] => {
  // Guard against zero conversion factor to prevent division by zero
  const safeCF = conversionFactor || 1

  // Total stock is always in base units
  const totalStockBase = batches.reduce((sum, batch) => sum + getBatchQuantity(batch), 0)

  // Sum other items' allocations in base units (each item may use a different unit)
  const allocatedOtherBase = allItems
    .filter((item) => item.product.id === target.product.id && item.id !== target.id)
    .reduce((sum, item) => sum + item.quantity * getItemConversionFactor(item), 0)

  // Max available for this item, converted to the target's selected unit
  const maxBaseForItem = Math.max(0, totalStockBase - allocatedOtherBase)
  const maxForItem = Math.floor(maxBaseForItem / safeCF)
  const desiredQty = Math.max(1, Math.floor(desired || 1))
  const capped = allowOverStock ? desiredQty : Math.min(desiredQty, maxForItem)

  // Track per-batch allocations by other items in base units
  const allocationsBase = new Map<string, number>()
  allItems.forEach((item) => {
    if (item.product.id !== target.product.id) return
    if (item.id === target.id) return
    if (!item.batchId) return
    const itemCF = getItemConversionFactor(item)
    allocationsBase.set(
      item.batchId,
      (allocationsBase.get(item.batchId) ?? 0) + item.quantity * itemCF
    )
  })

  let remaining = capped // in target unit

  const nextItems: SaleOrderItem[] = allItems
    .map((item) => {
      if (item.id !== target.id) return item

      const batch = batches.find((entry) => entry.id === item.batchId)
      const batchBase = batch ? getBatchQuantity(batch) : 0
      const availableBase = Math.max(
        0,
        batchBase - (allocationsBase.get(item.batchId ?? '') ?? 0)
      )
      // Convert available base units to the target's selected unit
      const availableInUnit = Math.floor(availableBase / safeCF)
      const assigned = Math.min(remaining, availableInUnit)
      remaining -= assigned

      // Tính lại stock theo đơn vị đang chọn — cần thiết khi đổi đơn vị,
      // nếu không dòng vượt tồn sẽ không được phát hiện tới lần refetch sau.
      return { ...item, quantity: assigned, stock: Math.floor(batchBase / safeCF) }
    })
    // Khi cho phép vượt tồn, giữ lại dòng target dù chưa được cấp phát lô nào —
    // phần vượt sẽ được cộng vào dòng này ở cuối hàm.
    .filter((item) => item.quantity > 0 || (allowOverStock && item.id === target.id))

  const startIndex = batches.findIndex((batch) => batch.id === target.batchId)
  // Wrap around: try batches after the current one first, then batches before it
  const nextBatches = startIndex >= 0
    ? [...batches.slice(startIndex + 1), ...batches.slice(0, startIndex)]
    : batches

  nextBatches.forEach((batch) => {
    if (remaining <= 0) return
    const availableBase = Math.max(
      0,
      getBatchQuantity(batch) - (allocationsBase.get(batch.id) ?? 0)
    )
    const availableInUnit = Math.floor(availableBase / safeCF)
    if (availableInUnit <= 0) return

    const assigned = Math.min(remaining, availableInUnit)
    remaining -= assigned

    const existingIndex = nextItems.findIndex(
      (item) => item.product.id === target.product.id && item.batchId === batch.id
    )

    if (existingIndex >= 0) {
      nextItems[existingIndex] = {
        ...nextItems[existingIndex],
        quantity: nextItems[existingIndex].quantity + assigned,
      }
      return
    }

    nextItems.push({
      id: `${target.product.id}-${batch.id}-${Date.now()}`,
      product: target.product,
      productUnitId: target.productUnitId,
      quantity: assigned,
      unitPrice: target.unitPrice,
      discount: 0,
      batchId: batch.id,
      batchCode: batch.batch_code ?? '',
      expiryDate: batch.expiry_date ?? '',
      stock: Math.floor(getBatchQuantity(batch) / safeCF),
    })
  })

  // Phần không lô nào gánh được chính là phần vượt tồn: dồn vào dòng target.
  if (allowOverStock && remaining > 0) {
    const targetIndex = nextItems.findIndex((item) => item.id === target.id)
    if (targetIndex >= 0) {
      nextItems[targetIndex] = {
        ...nextItems[targetIndex],
        quantity: nextItems[targetIndex].quantity + remaining,
      }
    }
  }

  return allowOverStock ? nextItems.filter((item) => item.quantity > 0) : nextItems
}

export const getDefaultUnit = (product: ProductWithUnits) =>
  product.product_units?.find((unit) => unit.is_base_unit) ??
  product.product_units?.[0]
