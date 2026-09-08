import { createStore, type StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'
import { type ProductWithUnits, type InventoryBatch } from '@/services/supabase/'
import { type PaymentMethod, type SaleOrderItem, type SaleOrderInCreate } from '../data/types'
import { generateOrderCode } from '../data/sale-order-helper'
import {
  allocateQuantityToBatches,
  getAllocatedByBatch,
  getDefaultUnit,
  getFallbackBatch,
  getItemConversionFactor,
  getNextAvailableBatch,
} from '../data/inventory-helpers'
import { selectBatchesByProductId } from './sale-order-selectors'
import { debouncedDraftStorage } from '../data/draft-storage'

// ── Types ───────────────────────────────────────────────────

export type SaleOrderState = {
  // Form state
  items: SaleOrderItem[]
  customerId: string
  orderDiscount: number
  paymentMethod: PaymentMethod
  cashReceived: number
  bankAccountId: string
  notes: string
  isAddCustomerOpen: boolean
  selectedLocationId: string | null
  orderCode: string
  startedAt: number // timestamp (ms) when order creation started
  // External data (synced from props)
  inventoryBatches: InventoryBatch[]
  // Init params (immutable)
  initialData: SaleOrderInCreate
}

export type SaleOrderActions = {
  // Setters
  setCustomerId: (id: string) => void
  setSelectedLocationId: (id: string | null) => void
  setOrderDiscount: (v: number) => void
  setPaymentMethod: (v: PaymentMethod) => void
  setCashReceived: (v: number) => void
  setBankAccountId: (v: string) => void
  setNotes: (v: string) => void
  setIsAddCustomerOpen: (v: boolean) => void
  // Item actions
  addProduct: (product: ProductWithUnits, unitId?: string) => void
  updateItem: (itemId: string, next: Partial<SaleOrderItem>) => void
  handleQuantityChange: (itemId: string, nextQuantity: number) => void
  handleUnitChange: (itemId: string, newUnitId: string) => void
  removeItem: (itemId: string) => void
  resetItems: () => void
  resetOrder: () => void
  // External data sync
  syncInventoryBatches: (batches: InventoryBatch[]) => void
}

export type SaleOrderStore = SaleOrderState & SaleOrderActions

// ── Store factory ───────────────────────────────────────────

export type CreateSaleOrderStoreParams = {
  initialData: SaleOrderInCreate
  inventoryBatches: InventoryBatch[]
  // Khi có: bật persist (localStorage) để giữ nháp khi chuyển màn/reload.
  // Khi không (chế độ edit): store thường, không persist.
  storageKey?: string
}

export function createSaleOrderStore({ initialData, inventoryBatches, storageKey }: CreateSaleOrderStoreParams) {
  const initializer: StateCreator<SaleOrderStore> = (set, get) => ({
    // ── Initial state ─────────────────────────────────────────
    items: initialData.items,
    customerId: initialData.customerId,
    orderDiscount: initialData.orderDiscount,
    paymentMethod: initialData.paymentMethod,
    cashReceived: initialData.paidAmount,
    bankAccountId: initialData.bankAccountId ?? '',
    notes: initialData.notes ?? '',
    isAddCustomerOpen: false,
    selectedLocationId: initialData.locationId || null,
    orderCode: initialData.orderCode,
    startedAt: Date.now(),
    inventoryBatches,
    initialData,

    // ── Setters ───────────────────────────────────────────────
    setCustomerId: (id) => set({ customerId: id }),
    setSelectedLocationId: (id) => set({ selectedLocationId: id }),
    setOrderDiscount: (v) => set({ orderDiscount: v }),
    setPaymentMethod: (v) => set({ paymentMethod: v }),
    setCashReceived: (v) => set({ cashReceived: v }),
    setBankAccountId: (v) => set({ bankAccountId: v }),
    setNotes: (v) => set({ notes: v }),
    setIsAddCustomerOpen: (v) => set({ isAddCustomerOpen: v }),

    // ── Item actions ──────────────────────────────────────────
    addProduct: (product, unitId) => {
      const state = get()
      if (!state.selectedLocationId) {
        toast.error('Bạn cần phải chọn cửa hàng.')
        return
      }

      const batchesByProduct = selectBatchesByProductId(state)
      const selectedUnit =
        (unitId && product.product_units?.find((u) => u.id === unitId)) ||
        getDefaultUnit(product)
      const unitPrice = selectedUnit?.sell_price ?? 0
      const batches = batchesByProduct[product.id]

      if (!batches || batches.length === 0) {
        toast.error(`Sản phẩm ${product.product_name} không có lô tồn kho phù hợp.`)
        return
      }

      const allocations = getAllocatedByBatch(product.id, state.items)
      const availableBatch = getNextAvailableBatch(batches, allocations)
      // Hết tồn vẫn cho thêm vào đơn (đơn đặt trước / chờ nhập hàng), chỉ cảnh báo.
      // Dòng sẽ được tô đỏ và đơn chỉ lưu nháp được, không hoàn tất được.
      const nextBatch = availableBatch ?? getFallbackBatch(batches, state.items, product.id)

      if (!nextBatch) {
        toast.error(`Sản phẩm ${product.product_name} không có lô tồn kho phù hợp.`)
        return
      }

      if (!availableBatch) {
        toast.warning(`Sản phẩm ${product.product_name} đã hết tồn kho.`)
      }

      const conversionFactor = selectedUnit?.conversion_factor || 1
      const batchStock = Math.floor((nextBatch.quantity ?? 0) / conversionFactor)

      // Lô fallback có thể đã có dòng trong đơn → tăng số lượng thay vì tạo dòng trùng.
      const existing = state.items.find(
        (item) =>
          item.product.id === product.id &&
          item.batchId === nextBatch.id &&
          item.productUnitId === (selectedUnit?.id ?? null)
      )

      if (existing) {
        set({
          items: state.items.map((item) =>
            item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        })
        return
      }

      set({
        items: [
          ...state.items,
          {
            id: `${product.id}-${Date.now()}`,
            product,
            productUnitId: selectedUnit?.id ?? null,
            quantity: 1,
            unitPrice,
            discount: 0,
            batchId: nextBatch.id,
            batchCode: nextBatch.batch_code ?? '',
            expiryDate: nextBatch.expiry_date ?? '',
            stock: batchStock,
          },
        ],
      })
    },

    updateItem: (itemId, next) => {
      set((state) => ({
        items: state.items.map((item) => (item.id === itemId ? { ...item, ...next } : item)),
      }))
    },

    handleQuantityChange: (itemId, nextQuantity) => {
      const state = get()
      const target = state.items.find((item) => item.id === itemId)
      if (!target) return

      const batchesByProduct = selectBatchesByProductId(state)
      const batches = batchesByProduct[target.product.id] ?? []
      if (batches.length === 0) {
        toast.error('Không tìm thấy tồn kho cho sản phẩm này.')
        return
      }

      const conversionFactor = getItemConversionFactor(target)
      const totalStockBase = batches.reduce((sum, batch) => sum + (batch.quantity ?? 0), 0)
      const allocatedOtherBase = state.items
        .filter((item) => item.product.id === target.product.id && item.id !== target.id)
        .reduce((sum, item) => sum + item.quantity * getItemConversionFactor(item), 0)
      const maxBaseForItem = Math.max(0, totalStockBase - allocatedOtherBase)
      const maxForItem = Math.floor(maxBaseForItem / (conversionFactor || 1))
      const desired = Math.max(1, Math.floor(nextQuantity || 1))

      if (desired > maxForItem) {
        toast.warning('Số lượng vượt quá tồn kho hiện tại.')
      }

      set({
        items: allocateQuantityToBatches({
          target,
          desired,
          batches,
          allItems: state.items,
          conversionFactor,
          allowOverStock: true,
        }),
      })
    },

    handleUnitChange: (itemId, newUnitId) => {
      const state = get()
      const target = state.items.find((item) => item.id === itemId)
      if (!target) return

      const selectedUnit = target.product.product_units?.find((u) => u.id === newUnitId)
      if (!selectedUnit) return

      const batchesByProduct = selectBatchesByProductId(state)
      const newCF = selectedUnit.conversion_factor || 1
      const batches = batchesByProduct[target.product.id] ?? []

      const totalStockBase = batches.reduce((sum, batch) => sum + (batch.quantity ?? 0), 0)
      const allocatedOtherBase = state.items
        .filter((item) => item.product.id === target.product.id && item.id !== target.id)
        .reduce((sum, item) => sum + item.quantity * getItemConversionFactor(item), 0)
      const maxBaseForItem = Math.max(0, totalStockBase - allocatedOtherBase)
      const maxInNewUnit = Math.floor(maxBaseForItem / newCF)

      // Vẫn cho đổi đơn vị khi tồn không đủ; dòng sẽ hiển thị vượt tồn kho.
      if (target.quantity > maxInNewUnit) {
        toast.warning('Số lượng vượt quá tồn kho hiện tại.')
      }

      const updatedTarget: SaleOrderItem = {
        ...target,
        productUnitId: newUnitId,
        unitPrice: selectedUnit.sell_price ?? target.unitPrice,
        quantity: target.quantity,
      }

      const updatedItems = state.items.map((item) =>
        item.id === itemId ? updatedTarget : item
      )

      set({
        items: allocateQuantityToBatches({
          target: updatedTarget,
          desired: updatedTarget.quantity,
          batches,
          allItems: updatedItems,
          conversionFactor: newCF,
          allowOverStock: true,
        }),
      })
    },

    removeItem: (itemId) => {
      set((state) => ({ items: state.items.filter((item) => item.id !== itemId) }))
    },

    resetItems: () => set({ items: [] }),

    resetOrder: () =>
      set({
        items: [],
        customerId: '',
        orderDiscount: 0,
        paymentMethod: '1_CASH',
        cashReceived: 0,
        notes: '',
        orderCode: generateOrderCode(),
        startedAt: Date.now(),
      }),

    // ── External data sync ────────────────────────────────────
    // Khi tồn kho mới về (refetch / khôi phục nháp), tính lại `stock` của từng
    // dòng theo lô hiện tại để cảnh báo vượt tồn kịp thời và tránh bán âm khi
    // nháp đã lưu trỏ tới lô đã hết/đã xoá.
    syncInventoryBatches: (batches) =>
      set((state) => ({
        inventoryBatches: batches,
        items: state.items.map((item) => {
          if (!item.batchId) return item
          const batch = batches.find((b) => b.id === item.batchId)
          const cf = getItemConversionFactor(item) || 1
          const stock = batch ? Math.floor((batch.quantity ?? 0) / cf) : 0
          return stock === item.stock ? item : { ...item, stock }
        }),
      })),
  })

  // Chế độ edit (không có storageKey): store thường, không persist.
  if (!storageKey) {
    return createStore<SaleOrderStore>()(initializer)
  }

  // Chế độ tạo mới: persist nháp vào localStorage để giữ khi chuyển màn/reload.
  return createStore<SaleOrderStore>()(
    persist(initializer, {
      name: storageKey,
      // Storage có debounce + flush khi rời trang (xem draft-storage.ts).
      storage: createJSONStorage(() => debouncedDraftStorage),
      // Giữ location mặc định khi nháp lưu giá trị rỗng, tránh ghi đè thành null
      // làm chặn việc thêm sản phẩm sau khi khôi phục.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SaleOrderStore>
        return {
          ...current,
          ...p,
          selectedLocationId: p.selectedLocationId ?? current.selectedLocationId,
        }
      },
      partialize: (s) => ({
        items: s.items,
        customerId: s.customerId,
        orderDiscount: s.orderDiscount,
        paymentMethod: s.paymentMethod,
        cashReceived: s.cashReceived,
        bankAccountId: s.bankAccountId,
        notes: s.notes,
        selectedLocationId: s.selectedLocationId,
        orderCode: s.orderCode,
        startedAt: s.startedAt,
      }),
    })
  )
}
