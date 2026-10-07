/**
 * Quy đổi số lượng bán (số thập phân, tối đa 3 chữ số) về ĐƠN VỊ CƠ BẢN.
 *
 * Bối cảnh: tồn kho (`inventory_batches.quantity`) nay là `numeric(14,3)` chứ không
 * còn là số nguyên, nên quy đổi suy biến thành một phép nhân thuần và KHÔNG còn
 * khái niệm dung sai. Phía Postgres cũng vậy: `quantity * conversion_factor` nằm
 * thẳng trong trigger, không còn hàm `sale_qty_to_base()`.
 *
 * Toàn bộ phép tính quyết định chạy bằng SỐ NGUYÊN ở thang phần nghìn (milli) vì
 * `0.333 * 30` trong JS ra 9.989999999999998, không phải 9.99. Quy tắc xuyên suốt:
 * MỌI phép cộng dồn và so sánh tồn kho chạy trên milli, không bao giờ trên float —
 * `0.3 + 0.6 = 0.8999999999999999` đủ để chặn một đơn hàng hợp lệ.
 *
 * Quy ước tên: `qtyMilli` là milli của ĐƠN VỊ ĐANG BÁN, `baseMilli` là milli của
 * ĐƠN VỊ CƠ BẢN; `baseMilli = qtyMilli × factor`.
 */

/** Số chữ số thập phân tối đa cho số lượng bán. */
export const QUANTITY_DECIMALS = 3

/** Hệ số của thang milli: 1 đơn vị = 1000 milli. */
export const QTY_SCALE = 1000

/** Số lượng nhỏ nhất bán được — áp dụng cho MỌI đơn vị, kể cả đơn vị cơ bản. */
export const MIN_QUANTITY = 1 / QTY_SCALE

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
 * Giá trị `numeric(14,3)` đọc từ DB → milli nguyên.
 *
 * Alias của `toQtyMilli` nhưng đặt tên riêng để đọc code biết đang ở thang nào:
 * trộn hai thang là lỗi im lặng, không phải lỗi biên dịch.
 */
export function toBaseMilli(base: number): number {
  return toQtyMilli(base)
}

/**
 * Số lượng theo đơn vị đang bán → milli ĐƠN VỊ CƠ BẢN.
 *
 * Luôn chính xác tuyệt đối: `qtyMilli` nguyên nhân `factor` nguyên. Không có đường
 * fail, không dung sai. Biên: 1e6 đơn vị × 1000 milli × factor 1e4 = 1e13 ≪ 2^53.
 */
export function qtyToBaseMilli(quantity: number, factor: number): number {
  return toQtyMilli(quantity) * SAFE_FACTOR(factor)
}

/** Như `qtyToBaseMilli` nhưng trả số thường (đơn vị cơ bản, 3 chữ số thập phân). */
export function toBaseQuantity(quantity: number, factor: number): number {
  return fromQtyMilli(qtyToBaseMilli(quantity, factor))
}

/**
 * Milli cơ bản → milli đơn vị đang bán, LÀM TRÒN XUỐNG (về phía 0).
 *
 * Bắt buộc làm tròn xuống chứ không `round`: làm tròn lên sinh ra số lượng tiêu thụ
 * NHIỀU HƠN tồn thật. Lô còn 11 Viên, 1 Hộp = 30 Viên: `round(11000/30) = 367` →
 * `0.367 × 30 = 11.01 > 11` → kho âm, `CHECK (quantity >= 0)` nổ 23514.
 * Hệ quả đã chấp nhận: phần lẻ không biểu diễn được ở lại trong lô.
 */
export function baseMilliToQtyMilli(baseMilli: number, factor: number): number {
  const f = SAFE_FACTOR(factor)
  return baseMilli >= 0 ? Math.floor(baseMilli / f) : -Math.floor(-baseMilli / f)
}

/**
 * Lượng tồn `base` quy về đơn vị đang bán, không bao giờ vượt quá `base`.
 * Không còn round-trip: `toBaseQuantity(baseToQuantity(10, 30), 30) === 9.99`.
 */
export function baseToQuantity(base: number, factor: number): number {
  return fromQtyMilli(baseMilliToQtyMilli(toBaseMilli(base), factor))
}

/**
 * Hợp lệ để gửi lên DB: lớn hơn 0 và không quá 3 chữ số thập phân.
 *
 * Khoan dung với sai số float (`0.33299999999999996` vẫn qua) để không chặn nhầm
 * người bán vì một phép trừ trong JS. Đổi lại, mọi payload gửi đi PHẢI đi qua
 * `roundQuantity` trước: RPC so `v_quantity <> round(v_quantity, 3)` và sẽ trả
 * INVALID_QUANTITY cho giá trị thô.
 */
export function isValidQuantity(quantity: number): boolean {
  if (!Number.isFinite(quantity) || quantity <= 0) return false
  return Math.abs(quantity * QTY_SCALE - Math.round(quantity * QTY_SCALE)) < 1e-6
}

/** Bản cho điều chỉnh kho: cho phép số âm, chỉ cấm 0. */
export function isValidSignedQuantity(quantity: number): boolean {
  return quantity !== 0 && isValidQuantity(Math.abs(quantity))
}

/**
 * Thành tiền một dòng = ROUND(số lượng × đơn giá).
 *
 * Nhân ở thang milli vì `0.145 * 100` trong JS ra 14.499999999999998 → làm tròn
 * thành 14 thay vì 15. Đây là bất biến chung của hệ thống: `line_total = ROUND(quantity × unit_price)` và
 * `order_total = Σ line_total − discount`. Hoá đơn in cho khách liệt kê từng dòng
 * nên tổng phải bằng tổng các dòng hiển thị, vì vậy mọi RPC báo cáo cũng phải dùng
 * `SUM(ROUND(soi.quantity * soi.unit_price))` chứ không phải `ROUND(SUM(...))`.
 */
export function lineAmount(quantity: number, unitPrice: number): number {
  return Math.round((toQtyMilli(quantity) * unitPrice) / QTY_SCALE)
}

const quantityFormatter = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: QUANTITY_DECIMALS,
  useGrouping: false,
})

/**
 * Hiển thị số lượng theo vi-VN: `0.333` → `0,333`, `9.99` → `9,99`, `1` → `1`.
 * Tắt phân nhóm hàng nghìn vì `1.000` dễ bị đọc nhầm thành một nghìn.
 */
export function formatQuantity(quantity: number): string {
  if (!Number.isFinite(quantity)) return '0'
  return quantityFormatter.format(roundQuantity(quantity))
}
