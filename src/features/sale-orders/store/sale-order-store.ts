import { createStore } from 'zustand'
import { toast } from 'sonner'
import { type ProductWithUnits, type InventoryBatch } from '@/services/supabase/'
import { type PaymentMethod, type SaleOrderItem, type SaleOrderInCreate } from '../data/types'
import { generateOrderCode } from '../data/sale-order-helper'
import { getDefaultUnit } from '../data/inventory-helpers'
import {
  allocateQuantityToBatches,
  getAllocatedByBatch,
  getItemConversionFactor,
  getNextAvailableBatch,
} from '../data/inventory-helpers'
import { selectBatchesByProductId } from './sale-order-selectors'

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
  addProduct: (product: ProductWithUnits) => void
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
}

export function createSaleOrderStore({ initialData, inventoryBatches }: CreateSaleOrderStoreParams) {
  return createStore<SaleOrderStore>()((set, get) => ({
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
    addProduct: (product) => {
      const state = get()
      if (!state.selectedLocationId) {
        toast.error('Bạn cần phải chọn cửa hàng.')
        return
      }

      const batchesByProduct = selectBatchesByProductId(state)
      const defaultUnit = getDefaultUnit(product)
      const unitPrice = defaultUnit?.sell_price ?? 0
      const batches = batchesByProduct[product.id]

      if (!batches || batches.length === 0) {
        toast.error(`Sản phẩm ${product.product_name} không có lô tồn kho phù hợp.`)
        return
      }

      const allocations = getAllocatedByBatch(product.id, state.items)
      const nextBatch = getNextAvailableBatch(batches, allocations)

      if (!nextBatch) {
        toast.error(`Sản phẩm ${product.product_name} đã hết tồn kho.`)
        return
      }

      const conversionFactor = defaultUnit?.conversion_factor || 1
      const batchStock = Math.floor((nextBatch.quantity ?? 0) / conversionFactor)

      set({
        items: [
          ...state.items,
          {
            id: `${product.id}-${Date.now()}`,
            product,
            productUnitId: defaultUnit?.id ?? null,
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

      if (Math.min(desired, maxForItem) < desired) {
        toast.error('Số lượng vượt quá tồn kho hiện tại.')
      }

      set({
        items: allocateQuantityToBatches({ target, desired, batches, allItems: state.items, conversionFactor }),
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

      if (maxInNewUnit <= 0) {
        toast.error('Tồn kho không đủ cho đơn vị này.')
        return
      }

      const cappedQuantity = Math.min(target.quantity, maxInNewUnit)

      if (cappedQuantity < target.quantity) {
        toast.error('Số lượng vượt quá tồn kho hiện tại.')
      }

      const updatedTarget: SaleOrderItem = {
        ...target,
        productUnitId: newUnitId,
        unitPrice: selectedUnit.sell_price ?? target.unitPrice,
        quantity: cappedQuantity,
      }

      const updatedItems = state.items.map((item) =>
        item.id === itemId ? updatedTarget : item
      )

      set({
        items: allocateQuantityToBatches({
          target: updatedTarget,
          desired: cappedQuantity,
          batches,
          allItems: updatedItems,
          conversionFactor: newCF,
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
    syncInventoryBatches: (batches) => set({ inventoryBatches: batches }),
  }))
}
