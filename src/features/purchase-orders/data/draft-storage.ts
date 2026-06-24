import { type OrderItem } from './types'

// ── Hằng số lưu trữ nháp đơn nhập hàng ──────────────────────
export const DRAFT_KEY_PREFIX = 'purchase-order-draft:'
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000 // 24 giờ
const DRAFT_PERSIST_DEBOUNCE_MS = 400

// Khác sale-orders (nhiều tab): purchase-order chỉ có 1 đơn đang nhập tại một
// thời điểm nên dùng 1 key duy nhất, scope theo tenant để không lẫn nháp giữa
// các tài khoản trên cùng trình duyệt.
export function purchaseDraftKey(tenantId: string): string {
  return `${DRAFT_KEY_PREFIX}${tenantId}`
}

// Payload lưu: chỉ các field form, kèm `savedAt` để tính hết hạn TTL.
export type PurchaseOrderDraft = {
  items: OrderItem[]
  supplierId: string
  orderDiscount: number
  notes: string
  selectedLocationId: string | null
  orderCode: string
  issuedAt: string
}

type StoredDraft = PurchaseOrderDraft & { savedAt: number }

// ── Bọc truy cập localStorage an toàn (ẩn danh / hết quota) ──
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

// ── Ghi có debounce + flush khi rời trang ───────────────────
// Gom các lần ghi (mỗi ký tự ghi chú, mỗi lần đổi số lượng...) và chỉ flush sau
// một khoảng lặng ngắn để tránh JSON.stringify + setItem chặn main thread liên
// tục. Flush ngay khi rời/ẩn trang để gần như không mất dữ liệu khi reload/đóng
// tab (chỉ còn mất khi tiến trình bị kill đột ngột).
const pendingWrites = new Map<string, string>()
let flushTimer: ReturnType<typeof setTimeout> | null = null

function flushPendingWrites(): void {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  for (const [key, value] of pendingWrites) safeSetItem(key, value)
  pendingWrites.clear()
}

let flushListenersAttached = false
function ensureFlushListeners(): void {
  if (flushListenersAttached || typeof window === 'undefined') return
  flushListenersAttached = true
  // `pagehide` đáng tin hơn `beforeunload` trên mobile/PWA.
  window.addEventListener('pagehide', flushPendingWrites)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPendingWrites()
  })
}

export function savePurchaseOrderDraft(key: string, draft: PurchaseOrderDraft): void {
  if (typeof window === 'undefined') return
  ensureFlushListeners()
  const stored: StoredDraft = { ...draft, savedAt: Date.now() }
  pendingWrites.set(key, JSON.stringify(stored))
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(flushPendingWrites, DRAFT_PERSIST_DEBOUNCE_MS)
}

export function clearPurchaseOrderDraft(key: string): void {
  // Huỷ lần ghi đang chờ cho key này, nếu không flush sau đó sẽ tái tạo entry
  // vừa xoá → "hồi sinh" nháp đã đóng.
  pendingWrites.delete(key)
  safeRemoveItem(key)
}

export function loadPurchaseOrderDraft(key: string): PurchaseOrderDraft | null {
  const raw = safeGetItem(key)
  if (!raw) return null
  let stored: StoredDraft
  try {
    stored = JSON.parse(raw) as StoredDraft
  } catch {
    safeRemoveItem(key)
    return null
  }
  const savedAt = stored.savedAt
  if (typeof savedAt !== 'number' || Date.now() - savedAt > DRAFT_TTL_MS) {
    safeRemoveItem(key)
    return null
  }
  const { savedAt: _savedAt, ...draft } = stored
  return draft
}
