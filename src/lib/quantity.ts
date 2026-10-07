/**
 * Quy đổi số lượng bán (có thể là số thập phân) về ĐƠN VỊ CƠ BẢN.
 *
 * Bối cảnh: tồn kho (`inventory_batches.quantity`) luôn là số nguyên theo đơn vị
 * cơ bản, trong khi người bán có thể gõ số lẻ theo đơn vị lớn hơn — ví dụ
 * `0.333 Hộp` với 1 Hộp = 30 Viên. Mọi phép trừ kho phải ra số nguyên Viên.
 *
 * Toàn bộ phép tính quyết định chạy bằng SỐ NGUYÊN ở thang phần nghìn (milli)
 * vì `0.333 * 30` trong JS ra 9.989999999999998, không phải 9.99.
 *
 * Bản sao của logic này nằm trong Postgres: `public.sale_qty_to_base()`
 * (migration 20261005000001_sale_order_decimal_quantity.sql). Sửa một bên thì
 * phải sửa bên kia.
 */

/** Số chữ số thập phân tối đa cho số lượng bán. */
export const QUANTITY_DECIMALS = 3

/** Hệ số của thang milli: 1 đơn vị = 1000 milli. */
export const QTY_SCALE = 1000

/**
 * Hệ số quy đổi từ đó trở lên thì KHÔNG cho nhập số lẻ.
 *
 * `round()` chỉ xác định duy nhất khi dung sai < 0.5 đơn vị cơ bản, mà sàn dung
 * sai (sai số biểu diễn 3 chữ số) là 0.0005 × factor — chạm 0.5 đúng tại 1000.
 * Ví dụ hỏng thật: factor 1200, 3 Viên → 3/1200 = 0.0025 → làm tròn 3 chữ số
 * thành 0.003 → 0.003 × 1200 = 3.6 → round = 4 ≠ 3.
 */
export const MAX_FACTOR_FOR_DECIMAL = 1000

/** Chuỗi hợp lệ khi đang gõ: tuỳ chọn dấu âm, tối đa 3 chữ số thập phân, chấp nhận cả `,` lẫn `.`. */
export const QUANTITY_INPUT_PATTERN = /^-?\d*(?:[.,]\d{0,3})?$/

const SAFE_FACTOR = (factor: number) => (Number.isFinite(factor) && factor > 0 ? Math.trunc(factor) : 1)

/**
 * Parse THẲNG từ chuỗi sang milli, không qua `parseFloat` rồi nhân (tránh làm
 * tròn hai lần). Trả `null` khi chuỗi không phải một số hợp lệ.
 */
export function parseQtyMilli(raw: string): number | null {
  const match = /^(-?)(\d*)(?:[.,](\d{0,3}))?$/.exec(raw.trim())
  if (!match) return null
  const [, sign, int, frac = ''] = match
  if (int === '' && frac === '') return null
  const milli = Number(int || '0') * QTY_SCALE + Number(frac.padEnd(3, '0') || '0')
  return sign === '-' ? -milli : milli
}

/** Số lượng (đơn vị đang bán) → milli nguyên. */
export function toQtyMilli(quantity: number): number {
  return Math.round(quantity * QTY_SCALE)
}

/** Milli → số lượng, làm tròn đúng 3 chữ số thập phân. */
export function fromQtyMilli(milli: number): number {
  return milli / QTY_SCALE
}

/** Làm tròn số lượng về 3 chữ số thập phân. */
export function roundQuantity(quantity: number): number {
  return fromQtyMilli(toQtyMilli(quantity))
}

/**
 * Dung sai cho phép, tính ở thang milli và nhân đôi để mọi vế đều là số nguyên.
 *
 * Dung sai thật (đơn vị cơ bản) = max(0.0005 × factor, min(0.15, 0.05 × factor)):
 * - `0.05 × factor` — 5% của một đơn vị đang bán. Với đơn vị cơ bản (factor 1)
 *   dung sai chỉ còn 0.05 nên `1.1` bị từ chối: chỉ đơn vị lớn mới cho số lẻ.
 * - cap `0.15` — giữ dung sai hữu hạn khi factor lớn, để `0.34 × 30 = 10.2` vẫn chặn.
 * - sàn `0.0005 × factor` — bảo đảm round-trip: giá trị do chính FIFO sinh ra
 *   (`baseToQuantity`) luôn được chấp nhận lại.
 */
function toleranceDoubleMilli(factor: number): number {
  return Math.max(factor, Math.min(300, 100 * factor))
}

/**
 * Quy đổi số lượng (milli) sang số nguyên đơn vị cơ bản.
 * Trả `null` khi không quy đổi được — caller tự quyết định thông báo lỗi.
 */
export function toBaseQuantityMilli(qtyMilli: number, factor: number): number | null {
  if (!Number.isInteger(qtyMilli) || qtyMilli <= 0) return null

  const f = SAFE_FACTOR(factor)

  // Đơn vị quá lớn: số lẻ không round-trip được, chỉ nhận số nguyên.
  if (f >= MAX_FACTOR_FOR_DECIMAL && qtyMilli % QTY_SCALE !== 0) return null

  const num = qtyMilli * f // nguyên, ≤ ~1e11 ≪ 2^53 → chính xác tuyệt đối
  const base = Math.floor((num + QTY_SCALE / 2) / QTY_SCALE) // = round(num / 1000)

  if (base < 1) return null
  if (2 * Math.abs(num - QTY_SCALE * base) > toleranceDoubleMilli(f)) return null

  return base
}

/** Như `toBaseQuantityMilli` nhưng nhận số lượng thường. */
export function toBaseQuantity(quantity: number, factor: number): number | null {
  return toBaseQuantityMilli(toQtyMilli(quantity), factor)
}

/**
 * Số nguyên đơn vị cơ bản → số lượng theo đơn vị đang bán (3 chữ số thập phân).
 * Với factor < 1000, `toBaseQuantity(baseToQuantity(n, f), f) === n` luôn đúng.
 */
export function baseToQuantity(base: number, factor: number): number {
  return fromQtyMilli(Math.round((base * QTY_SCALE) / SAFE_FACTOR(factor)))
}

/** Số lượng nhỏ nhất bán được theo đơn vị này: đúng 1 đơn vị cơ bản. */
export function minQuantityForFactor(factor: number): number {
  return baseToQuantity(1, factor)
}

export function isQuantityConvertible(quantity: number, factor: number): boolean {
  return toBaseQuantity(quantity, factor) !== null
}

const quantityFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: QUANTITY_DECIMALS,
  useGrouping: false,
})

/**
 * Hiển thị số lượng theo vi-VN: `0.333` → `0,333`, `1` → `1`.
 * Tắt phân nhóm hàng nghìn vì `1.000` dễ bị đọc nhầm thành một nghìn.
 */
export function formatQuantity(quantity: number): string {
  if (!Number.isFinite(quantity)) return '0'
  return quantityFormatter.format(roundQuantity(quantity))
}
