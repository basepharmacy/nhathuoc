import { type InventoryBatch, ProductWithUnits } from '@/services/supabase/'
import { baseToQuantity, toBaseQuantity } from '@/lib/quantity'
import { type SaleOrderItem } from './types'

export const getBatchQuantity = (batch: InventoryBatch) => batch.quantity ?? 0

/** Return the conversion factor for an item's currently-selected unit (defaults to 1 for base unit). */
export const getItemConversionFactor = (item: SaleOrderItem): number => {
  const unit = item.product.product_units?.find((u) => u.id === item.productUnitId)
  return unit?.conversion_factor || 1
}

/** Tên đơn vị cơ bản của sản phẩm, dùng để ghép vào thông báo lỗi. */
export const getBaseUnitName = (product: ProductWithUnits): string =>
  product.product_units?.find((u) => u.is_base_unit)?.unit_name ?? 'đơn vị cơ bản'

/**
 * Số lượng của một dòng quy về đơn vị cơ bản. Trả 0 khi không quy đổi được —
 * các phép cộng dồn tồn kho dùng hàm này nên phải luôn ra số, còn việc chặn
 * người dùng đã làm ở tầng nhập liệu và lúc submit.
 */
export const getItemBaseQuantity = (item: SaleOrderItem): number =>
  toBaseQuantity(item.quantity, getItemConversionFactor(item)) ?? 0

export const getAllocatedByBatch = (productId: string, rows: SaleOrderItem[]) => {
  const map = new Map<string, number>()
  rows.forEach((row) => {
    if (row.product.id !== productId) return
    if (!row.batchId) return
    // Cộng dồn theo ĐƠN VỊ CƠ BẢN: các dòng cùng lô có thể đang dùng đơn vị khác nhau.
    map.set(row.batchId, (map.get(row.batchId) ?? 0) + getItemBaseQuantity(row))
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
export const isItemOverStock = (item: SaleOrderItem) =>
  getItemBaseQuantity(item) > item.stockBase

/** Tổng tồn kho của các dòng KHÁC cùng sản phẩm, theo đơn vị cơ bản. */
export const getAllocatedOtherBase = (
  target: SaleOrderItem,
  allItems: SaleOrderItem[]
) =>
  allItems
    .filter((item) => item.product.id === target.product.id && item.id !== target.id)
    .reduce((sum, item) => sum + getItemBaseQuantity(item), 0)

let rowSeq = 0

/**
 * FIFO batch allocation: phân bổ số lượng mong muốn qua các lô, bắt đầu từ lô
 * đang chọn rồi tràn sang các lô tiếp theo.
 *
 * Toàn bộ phép tính chạy theo ĐƠN VỊ CƠ BẢN (số nguyên); số lượng hiển thị của
 * mỗi dòng mới được quy ngược về đơn vị đang chọn ở bước cuối. Làm ngược lại
 * (tính theo đơn vị đang chọn rồi chia cho hệ số) sẽ mất tới `factor - 1` đơn vị
 * cơ bản mỗi lô — một lô còn 25 Viên với 1 Hộp = 30 Viên sẽ bị bỏ qua hoàn toàn.
 */
export const allocateQuantityToBatches = ({
  target,
  desiredBase,
  batches,
  allItems,
  conversionFactor = 1,
  allowOverStock = false,
}: {
  target: SaleOrderItem
  /** Số lượng mong muốn, đã quy về ĐƠN VỊ CƠ BẢN (số nguyên ≥ 1). */
  desiredBase: number
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
  const allocatedOtherBase = getAllocatedOtherBase(target, allItems)

  const maxBaseForItem = Math.max(0, totalStockBase - allocatedOtherBase)
  const wanted = Math.max(1, Math.round(desiredBase))
  const capped = allowOverStock ? wanted : Math.min(wanted, maxBaseForItem)

  // Track per-batch allocations by other items in base units
  const allocationsBase = new Map<string, number>()
  allItems.forEach((item) => {
    if (item.product.id !== target.product.id) return
    if (item.id === target.id) return
    if (!item.batchId) return
    allocationsBase.set(
      item.batchId,
      (allocationsBase.get(item.batchId) ?? 0) + getItemBaseQuantity(item)
    )
  })

  let remainingBase = capped

  const nextItems: SaleOrderItem[] = allItems
    .map((item) => {
      if (item.id !== target.id) return item

      const batch = batches.find((entry) => entry.id === item.batchId)
      const batchBase = batch ? getBatchQuantity(batch) : 0
      const availableBase = Math.max(
        0,
        batchBase - (allocationsBase.get(item.batchId ?? '') ?? 0)
      )
      const assignedBase = Math.min(remainingBase, availableBase)
      remainingBase -= assignedBase

      return {
        ...item,
        quantity: baseToQuantity(assignedBase, safeCF),
        stockBase: batchBase,
      }
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
    if (remainingBase <= 0) return
    const availableBase = Math.max(
      0,
      getBatchQuantity(batch) - (allocationsBase.get(batch.id) ?? 0)
    )
    if (availableBase <= 0) return

    const assignedBase = Math.min(remainingBase, availableBase)
    remainingBase -= assignedBase

    const existingIndex = nextItems.findIndex(
      (item) => item.product.id === target.product.id && item.batchId === batch.id
    )

    if (existingIndex >= 0) {
      const existing = nextItems[existingIndex]
      const mergedBase =
        (toBaseQuantity(existing.quantity, safeCF) ?? 0) + assignedBase
      nextItems[existingIndex] = {
        ...existing,
        quantity: baseToQuantity(mergedBase, safeCF),
      }
      return
    }

    nextItems.push({
      // Date.now() một mình không đủ: nhiều lô được tạo trong cùng một mili giây
      // sẽ trùng key React.
      id: `${target.product.id}-${batch.id}-${Date.now()}-${rowSeq++}`,
      product: target.product,
      productUnitId: target.productUnitId,
      quantity: baseToQuantity(assignedBase, safeCF),
      unitPrice: target.unitPrice,
      discount: 0,
      batchId: batch.id,
      batchCode: batch.batch_code ?? '',
      expiryDate: batch.expiry_date ?? '',
      stockBase: getBatchQuantity(batch),
    })
  })

  // Phần không lô nào gánh được chính là phần vượt tồn: dồn vào dòng target.
  if (allowOverStock && remainingBase > 0) {
    const targetIndex = nextItems.findIndex((item) => item.id === target.id)
    if (targetIndex >= 0) {
      const existing = nextItems[targetIndex]
      const mergedBase = (toBaseQuantity(existing.quantity, safeCF) ?? 0) + remainingBase
      nextItems[targetIndex] = {
        ...existing,
        quantity: baseToQuantity(mergedBase, safeCF),
      }
    }
  }

  return allowOverStock ? nextItems.filter((item) => item.quantity > 0) : nextItems
}

export const getDefaultUnit = (product: ProductWithUnits) =>
  product.product_units?.find((unit) => unit.is_base_unit) ??
  product.product_units?.[0]
