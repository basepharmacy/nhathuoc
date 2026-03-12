import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { saleOrdersRepo } from '@/client'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'
import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { type SaleOrder } from '@/services/supabase'
import { addOfflineMutation, isNetworkError } from '@/services/offline/mutation-queue'
import { type PaymentMethod, type SaleOrderItem, type SaleOrderInCreate } from '../data/types'
import { generateOrderCode } from '../data/sale-order-helper'
import { getDefaultUnit } from '../data/inventory-helpers'
import {
  allocateQuantityToBatches,
  getAllocatedByBatch,
  getItemConversionFactor,
  getNextAvailableBatch,
} from '../data/inventory-helpers'
import { useOnlineStatus } from '@/hooks/use-online-status'

type UseSaleOrderParams = {
  tenantId: string
  userId: string
  initialData: SaleOrderInCreate
  inventoryBatches: InventoryBatch[]
  onComplete?: (createdOrderId: string, status: SaleOrder['status']) => void
}

export function useSaleOrder({
  tenantId,
  userId,
  initialData,
  inventoryBatches,
  onComplete,
}: UseSaleOrderParams) {
  const queryClient = useQueryClient()
  const { isOnline } = useOnlineStatus()
  const isEdit = Boolean(initialData.id)

  // ── Form state (initialized from initialData) ─────────────
  const [items, setItems] = useState<SaleOrderItem[]>(initialData.items)
  const [customerId, setCustomerId] = useState(initialData.customerId)
  const [orderDiscount, setOrderDiscount] = useState(initialData.orderDiscount)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData.paymentMethod)
  const [cashReceived, setCashReceived] = useState(initialData.paidAmount)
  const [bankAccountId, setBankAccountId] = useState(initialData.bankAccountId ?? '')
  const [notes, setNotes] = useState(initialData.notes ?? '')
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(initialData.locationId || null)
  const [orderCode, setOrderCode] = useState(initialData.orderCode)

  // ── Derived / computed ──────────────────────────────────────
  const productIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.product.id))).sort(),
    [items]
  )

  const batchesByProductId = useMemo(() => {
    const inventoryBatchesByLocation = inventoryBatches.filter((batch) => batch.location_id === selectedLocationId)
    return inventoryBatchesByLocation.reduce<Record<string, InventoryBatch[]>>((acc, batch) => {
      if (!acc[batch.product_id]) acc[batch.product_id] = []
      acc[batch.product_id].push(batch)
      return acc
    }, {})
  }, [inventoryBatches, selectedLocationId])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice - item.discount, 0),
    [items]
  )

  const total = useMemo(
    () => Math.max(0, subtotal - orderDiscount),
    [subtotal, orderDiscount]
  )

  // ── Validation ──────────────────────────────────────────────
  const validateOrder = () => {
    if (!tenantId || !userId) throw new Error('Thiếu thông tin người dùng.')
    if (!selectedLocationId) throw new Error('Vui lòng chọn cửa hàng.')
    if (items.length === 0) throw new Error('Vui lòng thêm ít nhất 1 sản phẩm.')
  }

  // ── Mutations ───────────────────────────────────────────────
  const buildOrderItems = () =>
    items.map((item) => ({
      tenant_id: tenantId,
      product_id: item.product.id,
      product_unit_id: item.productUnitId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      discount: item.discount,
      batch_id: item.batchId ?? null,
    }))

  const handleMutationError = (error: unknown) => {
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'Đã xảy ra lỗi, vui lòng thử lại.'
    toast.error(message)
  }

  const createMutation = useMutation({
    mutationFn: async (status: SaleOrder['status']) => {
      validateOrder()
      const payload = {
        order: {
          sale_order_code: orderCode,
          customer_id: customerId || null,
          tenant_id: tenantId,
          user_id: userId,
          location_id: selectedLocationId,
          issued_at: new Date().toISOString(),
          status,
          customer_paid_amount: paymentMethod === 'CASH' ? cashReceived : 0,
          discount: orderDiscount,
          total_amount: total,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
        items: buildOrderItems(),
      }

      if (!isOnline) {
        await addOfflineMutation({
          type: 'create-sale-order',
          payload,
        })
        return { id: `offline-${Date.now()}`, _offline: true } as SaleOrder & { _offline?: boolean }
      }

      try {
        return await saleOrdersRepo.createSaleOrderWithItemsV2(payload)
      } catch (error) {
        if (isNetworkError(error)) {
          await addOfflineMutation({
            type: 'create-sale-order',
            payload,
          })
          return { id: `offline-${Date.now()}`, _offline: true } as SaleOrder & { _offline?: boolean }
        }
        throw error
      }
    },
    onSuccess: (order, status) => {
      const isOfflineQueued = (order as SaleOrder & { _offline?: boolean })._offline
      if (isOfflineQueued) {
        toast.success('Đã lưu đơn hàng offline. Sẽ tự đồng bộ khi có mạng.')
        onComplete?.(order.id, status)
        return
      }

      if (status === '2_COMPLETE') {
        queryClient.invalidateQueries({
          queryKey: ['dashboard-report', 'sales-statistics'],
        })
        queryClient.invalidateQueries({
          queryKey: ['dashboard-report', 'low-stock-products'],
        })
        queryClient.invalidateQueries({
          queryKey: ["inventory-batches", tenantId, 'all', 'all-available'],
        })
      }
      toast.success('Đã tạo đơn bán hàng.')
      onComplete?.(order.id, status)
    },
    onError: handleMutationError,
  })

  const updateMutation = useMutation({
    mutationFn: async (status: SaleOrder['status']) => {
      if (!initialData.id) throw new Error('Không tìm thấy đơn bán hàng.')
      validateOrder()

      await saleOrdersRepo.updateSaleOrderWithItems({
        orderId: initialData.id,
        tenantId,
        order: {
          customer_id: customerId || null,
          status,
          customer_paid_amount: paymentMethod === 'CASH' ? cashReceived : 0,
          discount: orderDiscount,
          total_amount: total,
          location_id: selectedLocationId,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
        items: buildOrderItems(),
      })
    },
    onSuccess: (_data, status) => {
      if (initialData.id) {
        queryClient.invalidateQueries({
          queryKey: ['sale-orders', tenantId, 'detail', initialData.id],
        })
      }

      if (status === '2_COMPLETE') {
        queryClient.invalidateQueries({
          queryKey: ['dashboard-report', 'sales-statistics'],
        })
        queryClient.invalidateQueries({
          queryKey: ['dashboard-report', 'low-stock-products'],
        })
      }

      toast.success('Đã cập nhật đơn bán hàng.')
      onComplete?.(initialData.id ?? '', status)
    },
    onError: handleMutationError,
  })

  // ── Item actions ────────────────────────────────────────────
  const addProduct = (product: ProductWithUnits) => {
    if (!selectedLocationId) {
      toast.error('Bạn cần phải chọn cửa hàng.')
      return
    }
    const defaultUnit = getDefaultUnit(product)
    const unitPrice = defaultUnit?.sell_price ?? 0

    const batches = batchesByProductId[product.id]

    if (!batches || batches.length === 0) {
      toast.error(`Sản phẩm ${product.product_name} không có lô tồn kho phù hợp.`)
      return
    }

    let outOfStock = false
    setItems((prev) => {
      const allocations = getAllocatedByBatch(product.id, prev)
      const nextBatch = getNextAvailableBatch(batches, allocations)

      if (!nextBatch) {
        outOfStock = true
        return prev
      }

      const conversionFactor = defaultUnit?.conversion_factor || 1
      const batchStock = Math.floor((nextBatch.quantity ?? 0) / conversionFactor)

      return [
        ...prev,
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
      ]
    })
    if (outOfStock) {
      toast.error(`Sản phẩm ${product.product_name} đã hết tồn kho.`)
    }
  }

  const updateItem = (itemId: string, next: Partial<SaleOrderItem>) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...next } : item)))
  }

  const handleQuantityChange = (itemId: string, nextQuantity: number) => {
    let toastMessage: string | null = null
    setItems((prev) => {
      const target = prev.find((item) => item.id === itemId)
      if (!target) return prev

      const batches = batchesByProductId[target.product.id] ?? []
      if (batches.length === 0) {
        toastMessage = 'Không tìm thấy tồn kho cho sản phẩm này.'
        return prev
      }

      const conversionFactor = getItemConversionFactor(target)
      const totalStockBase = batches.reduce((sum, batch) => sum + (batch.quantity ?? 0), 0)
      const allocatedOtherBase = prev
        .filter((item) => item.product.id === target.product.id && item.id !== target.id)
        .reduce((sum, item) => sum + item.quantity * getItemConversionFactor(item), 0)
      const maxBaseForItem = Math.max(0, totalStockBase - allocatedOtherBase)
      const maxForItem = Math.floor(maxBaseForItem / (conversionFactor || 1))
      const desired = Math.max(1, Math.floor(nextQuantity || 1))

      if (Math.min(desired, maxForItem) < desired) {
        toastMessage = 'Số lượng vượt quá tồn kho hiện tại.'
      }

      return allocateQuantityToBatches({ target, desired, batches, allItems: prev, conversionFactor })
    })
    if (toastMessage) {
      toast.error(toastMessage)
    }
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleUnitChange = (itemId: string, newUnitId: string) => {
    let toastMessage: string | null = null
    setItems((prev) => {
      const target = prev.find((item) => item.id === itemId)
      if (!target) return prev

      const selectedUnit = target.product.product_units?.find((u) => u.id === newUnitId)
      if (!selectedUnit) return prev

      const newCF = selectedUnit.conversion_factor || 1
      const batches = batchesByProductId[target.product.id] ?? []

      const totalStockBase = batches.reduce((sum, batch) => sum + (batch.quantity ?? 0), 0)
      const allocatedOtherBase = prev
        .filter((item) => item.product.id === target.product.id && item.id !== target.id)
        .reduce((sum, item) => sum + item.quantity * getItemConversionFactor(item), 0)
      const maxBaseForItem = Math.max(0, totalStockBase - allocatedOtherBase)
      const maxInNewUnit = Math.floor(maxBaseForItem / newCF)

      if (maxInNewUnit <= 0) {
        toastMessage = 'Tồn kho không đủ cho đơn vị này.'
        return prev
      }

      const cappedQuantity = Math.min(target.quantity, maxInNewUnit)

      if (cappedQuantity < target.quantity) {
        toastMessage = 'Số lượng vượt quá tồn kho hiện tại.'
      }

      const updatedTarget: SaleOrderItem = {
        ...target,
        productUnitId: newUnitId,
        unitPrice: selectedUnit.sell_price ?? target.unitPrice,
        quantity: cappedQuantity,
      }

      const updatedItems = prev.map((item) =>
        item.id === itemId ? updatedTarget : item
      )

      return allocateQuantityToBatches({
        target: updatedTarget,
        desired: cappedQuantity,
        batches,
        allItems: updatedItems,
        conversionFactor: newCF,
      })
    })
    if (toastMessage) {
      toast.error(toastMessage)
    }
  }

  const resetItems = useCallback(() => {
    setItems([])
  }, [])

  // ── Derived flags ───────────────────────────────────────────
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const saveDraft = () =>
    isEdit ? updateMutation.mutate('1_DRAFT') : createMutation.mutate('1_DRAFT')

  const submit = () =>
    isEdit ? updateMutation.mutate('2_COMPLETE') : createMutation.mutate('2_COMPLETE')

  const resetOrder = useCallback(() => {
    setItems([])
    setCustomerId('')
    setOrderDiscount(0)
    setPaymentMethod('CASH')
    setCashReceived(0)
    setNotes('')
    setOrderCode(generateOrderCode())
    //prevSubtotalRef.current = 0
  }, [])

  return {
    // Data
    items,
    batchesByProductId,
    orderCode,
    isEdit,
    isSubmitting,
    productIds,
    // Form state + setters
    customerId,
    setCustomerId,
    selectedLocationId,
    setSelectedLocationId,
    orderDiscount,
    setOrderDiscount,
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    bankAccountId,
    setBankAccountId,
    notes,
    setNotes,
    isAddCustomerOpen,
    setIsAddCustomerOpen,
    // Computed
    subtotal,
    // Actions
    addProduct,
    updateItem,
    handleQuantityChange,
    handleUnitChange,
    removeItem,
    resetItems,
    saveDraft,
    submit,
    resetOrder,
  }
}
