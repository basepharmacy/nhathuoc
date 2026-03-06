import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
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
 * FIFO batch allocation: distributes a desired quantity across inventory batches,
 * starting from the current batch and spilling over to subsequent batches.
 */
export const allocateQuantityToBatches = ({
  target,
  desired,
  batches,
  allItems,
  conversionFactor = 1,
}: {
  target: SaleOrderItem
  desired: number
  batches: InventoryBatch[]
  allItems: SaleOrderItem[]
  /** Conversion factor of the target item's selected unit (base unit = 1). */
  conversionFactor?: number
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
  const capped = Math.min(Math.max(1, Math.floor(desired || 1)), maxForItem)

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
      const availableBase = Math.max(
        0,
        (batch ? getBatchQuantity(batch) : 0) -
        (allocationsBase.get(item.batchId ?? '') ?? 0)
      )
      // Convert available base units to the target's selected unit
      const availableInUnit = Math.floor(availableBase / safeCF)
      const assigned = Math.min(remaining, availableInUnit)
      remaining -= assigned

      return { ...item, quantity: assigned }
    })
    .filter((item) => item.quantity > 0)

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
    })
  })

  return nextItems
}
