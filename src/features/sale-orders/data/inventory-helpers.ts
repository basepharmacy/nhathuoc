import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { type SaleOrderItem } from './types'

export const getBatchQuantity = (batch: InventoryBatch) => batch.quantity ?? 0

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
}: {
  target: SaleOrderItem
  desired: number
  batches: InventoryBatch[]
  allItems: SaleOrderItem[]
}): SaleOrderItem[] => {
  const totalStock = batches.reduce((sum, batch) => sum + getBatchQuantity(batch), 0)
  const allocatedOther = allItems
    .filter((item) => item.product.id === target.product.id && item.id !== target.id)
    .reduce((sum, item) => sum + item.quantity, 0)

  const maxForItem = Math.max(0, totalStock - allocatedOther)
  const capped = Math.min(Math.max(1, Math.floor(desired || 1)), maxForItem)

  const allocations = new Map<string, number>()
  allItems.forEach((item) => {
    if (item.product.id !== target.product.id) return
    if (item.id === target.id) return
    if (!item.batchId) return
    allocations.set(item.batchId, (allocations.get(item.batchId) ?? 0) + item.quantity)
  })

  let remaining = capped

  const nextItems: SaleOrderItem[] = allItems
    .map((item) => {
      if (item.id !== target.id) return item

      const batch = batches.find((entry) => entry.id === item.batchId)
      const available = Math.max(
        0,
        (batch ? getBatchQuantity(batch) : 0) - (allocations.get(item.batchId ?? '') ?? 0)
      )
      const assigned = Math.min(remaining, available)
      remaining -= assigned

      return { ...item, quantity: assigned }
    })
    .filter((item) => item.quantity > 0)

  const startIndex = batches.findIndex((batch) => batch.id === target.batchId)
  const nextBatches = startIndex >= 0 ? batches.slice(startIndex + 1) : batches

  nextBatches.forEach((batch) => {
    if (remaining <= 0) return
    const available = Math.max(0, getBatchQuantity(batch) - (allocations.get(batch.id) ?? 0))
    if (available <= 0) return

    const assigned = Math.min(remaining, available)
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
