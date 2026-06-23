import { type StateStorage } from 'zustand/middleware'
import { type Tab } from '../components/sale-order-tab-controls'

// ── Hằng số lưu trữ nháp đơn bán hàng ───────────────────────
export const DRAFT_SESSION_KEY = 'sale-order-draft-session'
export const DRAFT_TAB_PREFIX = 'sale-order-draft:'
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000 // 24 giờ

export type DraftSession = {
  tabs: Tab[]
  activeTabId: string
  // Thời điểm tạo từng tab (ms) dùng để tính hết hạn TTL. Lưu trực tiếp ở đây
  // thay vì đọc ngược từ payload persist của zustand — tránh phụ thuộc vào cấu
  // trúc nội bộ `{ state, version }` và tránh phụ thuộc thời điểm store flush.
  startedAtById: Record<string, number>
}

export type RestoredSession = {
  tabs: Tab[]
  activeTabId: string
  // Giá trị bộ đếm tab kế tiếp, suy ra từ id tab đã khôi phục.
  nextCounter: number
}

// Key persist của store từng tab (khớp với `name` của zustand persist)
export function draftTabStorageKey(tabId: string): string {
  return `${DRAFT_TAB_PREFIX}${tabId}`
}

// ── Bọc truy cập localStorage an toàn (chế độ ẩn danh / hết quota) ──
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

// ── Storage có debounce cho zustand persist ─────────────────
// Persist gọi setItem đồng bộ sau MỖI thay đổi state (mỗi ký tự gõ ghi chú,
// mỗi lần đổi số lượng...). Gom các lần ghi lại và chỉ flush sau khoảng lặng
// ngắn để tránh JSON.stringify + localStorage.setItem chặn main thread liên tục.
const DRAFT_PERSIST_DEBOUNCE_MS = 400

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
  // Flush ngay khi rời trang/ẩn tab để gần như không mất dữ liệu khi reload/đóng
  // tab (chỉ còn mất khi tiến trình bị kill đột ngột). `pagehide` đáng tin hơn
  // `beforeunload` trên mobile/PWA.
  window.addEventListener('pagehide', flushPendingWrites)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPendingWrites()
  })
}

export const debouncedDraftStorage: StateStorage = {
  getItem: (key) => safeGetItem(key),
  setItem: (key, value) => {
    ensureFlushListeners()
    pendingWrites.set(key, value)
    if (flushTimer) clearTimeout(flushTimer)
    flushTimer = setTimeout(flushPendingWrites, DRAFT_PERSIST_DEBOUNCE_MS)
  },
  // Xoá phải thực hiện ngay để không bị "ghi đè lại" bởi flush đang chờ.
  removeItem: (key) => {
    pendingWrites.delete(key)
    safeRemoveItem(key)
  },
}

export function clearDraftTab(tabId: string): void {
  const key = draftTabStorageKey(tabId)
  // Huỷ mọi lần ghi đang chờ cho tab này, nếu không flush sau đó sẽ tái tạo
  // entry vừa xoá → "hồi sinh" nháp đã đóng.
  pendingWrites.delete(key)
  safeRemoveItem(key)
}

export function clearDraftSession(): void {
  safeRemoveItem(DRAFT_SESSION_KEY)
}

function readSession(): DraftSession | null {
  const raw = safeGetItem(DRAFT_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DraftSession
  } catch {
    return null
  }
}

// Dọn các store nháp mồ côi: key `sale-order-draft:*` không nằm trong tập tab
// hợp lệ. Tránh tích tụ rác trong localStorage và tránh "hồi sinh" đơn cũ khi
// id tab bị tái sử dụng.
function gcOrphanTabs(validTabIds: Set<string>): void {
  let keys: string[]
  try {
    keys = Object.keys(localStorage)
  } catch {
    return
  }
  for (const key of keys) {
    if (!key.startsWith(DRAFT_TAB_PREFIX)) continue
    const tabId = key.slice(DRAFT_TAB_PREFIX.length)
    if (!validTabIds.has(tabId)) safeRemoveItem(key)
  }
}

// Suy ra bộ đếm tab kế tiếp từ id tab dạng `tab-<N>`.
function deriveNextCounter(tabs: Tab[]): number {
  const maxN = tabs.reduce((max, t) => {
    const n = Number(t.id.split('-')[1])
    return Number.isFinite(n) ? Math.max(max, n) : max
  }, 0)
  return maxN + 1
}

/**
 * Lưu metadata phiên. `startedAt` của mỗi tab được giữ nguyên nếu đã có, tab
 * mới được gán mốc thời gian hiện tại; mốc của tab đã đóng sẽ bị loại bỏ.
 */
export function saveDraftSession(tabs: Tab[], activeTabId: string): void {
  const prevStartedAt = readSession()?.startedAtById ?? {}
  const now = Date.now()
  const startedAtById: Record<string, number> = {}
  for (const tab of tabs) {
    startedAtById[tab.id] = prevStartedAt[tab.id] ?? now
  }
  safeSetItem(DRAFT_SESSION_KEY, JSON.stringify({ tabs, activeTabId, startedAtById }))
}

/**
 * Đọc phiên nháp, loại bỏ các tab đã hết hạn (> 24h) và dọn các store mồ côi.
 * Trả null nếu không còn tab hợp lệ.
 */
export function loadDraftSession(): RestoredSession | null {
  const session = readSession()
  if (!session?.tabs?.length) {
    clearDraftSession()
    gcOrphanTabs(new Set())
    return null
  }

  const now = Date.now()
  const startedAtById = session.startedAtById ?? {}

  const validTabs: Tab[] = []
  for (const tab of session.tabs) {
    const startedAt = startedAtById[tab.id]
    const expired = startedAt == null || now - startedAt > DRAFT_TTL_MS
    if (expired) {
      clearDraftTab(tab.id)
      continue
    }
    validTabs.push(tab)
  }

  gcOrphanTabs(new Set(validTabs.map((t) => t.id)))

  if (validTabs.length === 0) {
    clearDraftSession()
    return null
  }

  const activeTabId = validTabs.some((t) => t.id === session.activeTabId)
    ? session.activeTabId
    : validTabs[0].id

  return { tabs: validTabs, activeTabId, nextCounter: deriveNextCounter(validTabs) }
}
