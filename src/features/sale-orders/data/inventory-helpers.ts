import type { InventoryBatch, ProductWithUnits } from '@/services/supabase/'
import {
  baseMilliToQtyMilli,
  fromQtyMilli,
  qtyToBaseMilli,
  toBaseMilli,
  toQtyMilli,
} from '@/lib/quantity'
import { type SaleOrderItem } from './types'

export const getBatchQuantity = (batch: InventoryBatch) => batch.quantity ?? 0

/**
 * Tồn lô ở thang milli.
 *
 * MỌI phép cộng dồn và so sánh tồn kho phải dùng bản này: tồn kho nay là
 * `numeric(14,3)` nên `0.3 + 0.6` trong JS ra 0.8999999999999999, đủ để chặn một
 * đơn hàng hợp lệ mà không có dấu hiệu gì.
 */
export const getBatchMilli = (batch: InventoryBatch) => toBaseMilli(batch.quantity ?? 0)

/** Return the conversion factor for an item's currently-selected unit (defaults to 1 for base unit). */
export const getItemConversionFactor = (item: SaleOrderItem): number => {
  const unit = item.product.product_units?.find((u) => u.id === item.productUnitId)
  return unit?.conversion_factor || 1
}

/** Tên đơn vị cơ bản của sản phẩm, dùng để ghép vào thông báo lỗi. */
export const getBaseUnitName = (product: ProductWithUnits): string =>
  product.product_units?.find((u) => u.is_base_unit)?.unit_name ?? 'đơn vị cơ bản'

/** Số lượng của một dòng quy về milli đơn vị cơ bản. Luôn chính xác tuyệt đối. */
export const getItemBaseMilli = (item: SaleOrderItem): number =>
  qtyToBaseMilli(item.quantity, getItemConversionFactor(item))

export const getAllocatedByBatch = (productId: string, rows: SaleOrderItem[]) => {
  const map = new Map<string, number>()
  rows.forEach((row) => {
    if (row.product.id !== productId) return
    if (!row.batchId) return
    // Cộng dồn theo MILLI ĐƠN VỊ CƠ BẢN: các dòng cùng lô có thể đang dùng đơn vị khác nhau.
    map.set(row.batchId, (map.get(row.batchId) ?? 0) + getItemBaseMilli(row))
  })
  return map
}

export const getNextAvailableBatch = (
  batches: InventoryBatch[],
  allocations: Map<string, number>
) => {
  return (
    batches.find((batch) => {
      const available = getBatchMilli(batch) - (allocations.get(batch.id) ?? 0)
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

/**
 * Dòng đang bán vượt tồn kho của lô đang chọn (gồm cả trường hợp lô đã hết sạch).
 *
 * So milli với milli, không so float: lô 9,99 Viên bán 0,333 Hộp là HỢP LỆ
 * (9990 = 9990). So bằng float sẽ cho 9.989999999999998 > 9.99 → dòng bị tô đỏ và
 * nút Hoàn tất bị khoá mà không có thông báo nào.
 */
export const isItemOverStock = (item: SaleOrderItem) =>
  getItemBaseMilli(item) > toBaseMilli(item.stockBase)

/** Tổng số lượng của các dòng KHÁC cùng sản phẩm, theo milli đơn vị cơ bản. */
export const getAllocatedOtherMilli = (
  target: SaleOrderItem,
  allItems: SaleOrderItem[]
) =>
  allItems
    .filter((item) => item.product.id === target.product.id && item.id !== target.id)
    .reduce((sum, item) => sum + getItemBaseMilli(item), 0)

let rowSeq = 0

/**
 * FIFO batch allocation: phân bổ số lượng mong muốn qua các lô, bắt đầu từ lô
 * đang chọn rồi tràn sang các lô tiếp theo.
 *
 * Toàn bộ phép tính chạy theo MILLI ĐƠN VỊ CƠ BẢN (số nguyên); số lượng hiển thị
 * của mỗi dòng mới được quy ngược về đơn vị đang chọn ở bước cuối. Làm ngược lại
 * (tính theo đơn vị đang chọn rồi chia cho hệ số) sẽ mất tới `factor - 1` đơn vị
 * cơ bản mỗi lô — một lô còn 25 Viên với 1 Hộp = 30 Viên sẽ bị bỏ qua hoàn toàn.
 */
export const allocateQuantityToBatches = ({
  target,
  desiredBaseMilli,
  batches,
  allItems,
  conversionFactor = 1,
  allowOverStock = false,
}: {
  target: SaleOrderItem
  /** Số lượng mong muốn, đã quy về MILLI ĐƠN VỊ CƠ BẢN (số nguyên ≥ 1). */
  desiredBaseMilli: number
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
  const totalStockMilli = batches.reduce((sum, batch) => sum + getBatchMilli(batch), 0)
  const allocatedOtherMilli = getAllocatedOtherMilli(target, allItems)

  const maxMilliForItem = Math.max(0, totalStockMilli - allocatedOtherMilli)
  // Tối thiểu 0,001 đơn vị đang bán = safeCF milli cơ bản.
  const wanted = Math.max(safeCF, Math.round(desiredBaseMilli))
  const capped = allowOverStock ? wanted : Math.min(wanted, maxMilliForItem)

  // Track per-batch allocations by other items in base milli
  const allocationsMilli = new Map<string, number>()
  allItems.forEach((item) => {
    if (item.product.id !== target.product.id) return
    if (item.id === target.id) return
    if (!item.batchId) return
    allocationsMilli.set(
      item.batchId,
      (allocationsMilli.get(item.batchId) ?? 0) + getItemBaseMilli(item)
    )
  })

  let remainingMilli = capped

  const nextItems: SaleOrderItem[] = allItems
    .map((item) => {
      if (item.id !== target.id) return item

      const batch = batches.find((entry) => entry.id === item.batchId)
      const batchMilli = batch ? getBatchMilli(batch) : 0
      const availableMilli = Math.max(
        0,
        batchMilli - (allocationsMilli.get(item.batchId ?? '') ?? 0)
      )
      const assignedMilli = Math.min(remainingMilli, availableMilli)
      // Làm tròn XUỐNG: phần lẻ không biểu diễn được bằng 3 chữ số của đơn vị này
      // ở lại trong lô thay vì bị bán khống.
      const qtyMilli = baseMilliToQtyMilli(assignedMilli, safeCF)
      remainingMilli -= qtyMilli * safeCF

      return {
        ...item,
        quantity: fromQtyMilli(qtyMilli),
        stockBase: batch ? getBatchQuantity(batch) : 0,
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
    if (remainingMilli <= 0) return
    const availableMilli = Math.max(
      0,
      getBatchMilli(batch) - (allocationsMilli.get(batch.id) ?? 0)
    )
    if (availableMilli <= 0) return

    const assignedMilli = Math.min(remainingMilli, availableMilli)
    const qtyMilli = baseMilliToQtyMilli(assignedMilli, safeCF)
    if (qtyMilli <= 0) return
    remainingMilli -= qtyMilli * safeCF

    const existingIndex = nextItems.findIndex(
      (item) => item.product.id === target.product.id && item.batchId === batch.id
    )

    if (existingIndex >= 0) {
      const existing = nextItems[existingIndex]
      // Cộng ở thang qtyMilli, KHÔNG cộng base rồi chia lại: chia lại sẽ làm tròn
      // xuống lần thứ hai và mất thêm phần lẻ mỗi lần merge.
      const mergedQtyMilli = toQtyMilli(existing.quantity) + qtyMilli
      nextItems[existingIndex] = {
        ...existing,
        quantity: fromQtyMilli(mergedQtyMilli),
      }
      return
    }

    nextItems.push({
      // Date.now() một mình không đủ: nhiều lô được tạo trong cùng một mili giây
      // sẽ trùng key React.
      id: `${target.product.id}-${batch.id}-${Date.now()}-${rowSeq++}`,
      product: target.product,
      productUnitId: target.productUnitId,
      quantity: fromQtyMilli(qtyMilli),
      unitPrice: target.unitPrice,
      discount: 0,
      batchId: batch.id,
      batchCode: batch.batch_code ?? '',
      expiryDate: batch.expiry_date ?? '',
      stockBase: getBatchQuantity(batch),
    })
  })

  // Phần không lô nào gánh được chính là phần vượt tồn: dồn vào dòng target.
  //
  // Chỉ dồn khi phần dư >= 1 milli của đơn vị đang bán (= safeCF milli cơ bản).
  // Dư nhỏ hơn thế là "bụi" do tồn kho lẻ, không biểu diễn được bằng 3 chữ số thập
  // phân của đơn vị này — dồn vào sẽ bật cờ vượt tồn và khoá nút Hoàn tất vì
  // 0,008 Viên.
  if (allowOverStock && remainingMilli >= safeCF) {
    const targetIndex = nextItems.findIndex((item) => item.id === target.id)
    if (targetIndex >= 0) {
      const existing = nextItems[targetIndex]
      const mergedQtyMilli =
        toQtyMilli(existing.quantity) + baseMilliToQtyMilli(remainingMilli, safeCF)
      nextItems[targetIndex] = {
        ...existing,
        quantity: fromQtyMilli(mergedQtyMilli),
      }
    }
  }

  return allowOverStock ? nextItems.filter((item) => item.quantity > 0) : nextItems
}

export const getDefaultUnit = (product: ProductWithUnits) =>
  product.product_units?.find((unit) => unit.is_base_unit) ??
  product.product_units?.[0]
