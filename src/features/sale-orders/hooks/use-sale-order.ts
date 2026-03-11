import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { saleOrdersRepo } from '@/client'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'
import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { type SaleOrder } from '@/services/supabase/database/repo/saleOrdersRepo'
import { addOfflineMutation, isNetworkError } from '@/services/offline/mutation-queue'
import { type PaymentMethod, type SaleOrderItem } from '../data/types'
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
  orderId?: string
  userLocationId: string | null
  orderDetail?: {
    id: string
    sale_order_code: string | null
    status: SaleOrder['status']
    customer_id: string | null
    discount: number | null
    customer_paid_amount: number | null
    notes: string | null
    location_id: string | null
  }
  navigate: (opts: { search?: { orderId: string }; to?: string }) => void
  onComplete?: (createdOrderId: string) => void
}

export function useSaleOrder({
  tenantId,
  userId,
  orderId,
  userLocationId,
  orderDetail,
  navigate,
  onComplete,
}: UseSaleOrderParams) {
  const queryClient = useQueryClient()
  const { isOnline } = useOnlineStatus()
  const isEdit = Boolean(orderId)

  // ── Form state ──────────────────────────────────────────────
  const [items, setItems] = useState<SaleOrderItem[]>([])
  const [customerId, setCustomerId] = useState('')
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [paidAmount, setPaidAmount] = useState(0)
  const [cashReceived, setCashReceived] = useState(0)
  const [bankAccountId, setBankAccountId] = useState('')
  const [notes, setNotes] = useState('')
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(userLocationId)
  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>([])

  // ── Derived / computed ──────────────────────────────────────
  const generatedOrderCode = useMemo(() => {
    const timestamp = Date.now()
    const encoded = timestamp.toString(36).toUpperCase() // Convert to base36 for shorter string
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    return `${encoded}S${random}`
  }, [])

  const orderCode = isEdit ? (orderDetail?.sale_order_code ?? '') : generatedOrderCode
  const orderStatus: SaleOrder['status'] = orderDetail?.status ?? '1_DRAFT'
  const isComplete = orderStatus === '2_COMPLETE'
  const isReadOnly = isComplete || orderStatus === '9_CANCELLED'

  const productIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.product.id))).sort(),
    [items]
  )

  const batchesByProductId = useMemo(() => {
    return inventoryBatches.reduce<Record<string, InventoryBatch[]>>((acc, batch) => {
      if (!acc[batch.product_id]) acc[batch.product_id] = []
      acc[batch.product_id].push(batch)
      return acc
    }, {})
  }, [inventoryBatches])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice - item.discount, 0),
    [items]
  )

  const prevSubtotalRef = useRef(subtotal)
  useEffect(() => {
    if (prevSubtotalRef.current !== subtotal) {
      setOrderDiscount(0)
    }
    prevSubtotalRef.current = subtotal
  }, [subtotal])

  const totals = useMemo(
    () => ({ subtotal, total: Math.max(0, subtotal - orderDiscount) }),
    [subtotal, orderDiscount]
  )

  const changeAmount = useMemo(() => {
    if (paymentMethod !== 'CASH') return 0
    return Math.max(0, cashReceived - totals.total)
  }, [cashReceived, paymentMethod, totals.total])

  const normalizedPaidAmount = useMemo(() => {
    if (paymentMethod === 'CASH') return Math.min(totals.total, cashReceived)
    return Math.min(totals.total, paidAmount)
  }, [cashReceived, paidAmount, paymentMethod, totals.total])

  useEffect(() => {
    if (paymentMethod !== 'TRANSFER') return
    setPaidAmount(totals.total)
    setCashReceived(0)
  }, [paymentMethod, totals.total])

  const debtAmount = useMemo(
    () => Math.max(0, totals.total - normalizedPaidAmount),
    [normalizedPaidAmount, totals.total]
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
          customer_paid_amount: normalizedPaidAmount,
          discount: orderDiscount,
          total_amount: totals.total,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
        items: buildOrderItems(),
      }

      // If offline, queue mutation immediately instead of attempting Supabase call
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
        if (status === '2_COMPLETE' && onComplete) {
          onComplete(order.id)
        }
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
      if (status === '2_COMPLETE' && onComplete) {
        onComplete(order.id)
      }
    },
    onError: handleMutationError,
  })

  const updateMutation = useMutation({
    mutationFn: async (status: SaleOrder['status']) => {
      if (!orderId || !orderDetail) throw new Error('Không tìm thấy đơn bán hàng.')
      validateOrder()

      await saleOrdersRepo.updateSaleOrderWithItems({
        orderId: orderDetail.id,
        tenantId,
        order: {
          customer_id: customerId || null,
          status,
          customer_paid_amount: normalizedPaidAmount,
          discount: orderDiscount,
          total_amount: totals.total,
          location_id: selectedLocationId,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
        items: buildOrderItems(),
      })
    },
    onSuccess: (_data, status) => {
      if (orderId) {
        queryClient.invalidateQueries({
          queryKey: ['sale-orders', tenantId, 'detail', orderId],
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

      if (status === '9_CANCELLED') {
        toast.success('Huỷ đơn hàng thành công.')
        return
      }

      toast.success('Đã cập nhật đơn bán hàng.')
      navigate({ to: '/' })
    },
    onError: handleMutationError,
  })

  // ── Item actions ────────────────────────────────────────────
  const addProduct = (product: ProductWithUnits) => {
    if (isReadOnly || !tenantId) return
    if (!selectedLocationId) {
      toast.error('Bạn cần phải chọn cửa hàng.')
      return
    }
    const defaultUnit = getDefaultUnit(product)
    const unitPrice = defaultUnit?.sell_price ?? 0

    const batches = batchesByProductId[product.id]

    if (!batches || batches.length === 0) {
      toast.error(`Sản phẩm ${product.product_name} đã hết tồn kho.`)
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
    if (isReadOnly) return
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...next } : item)))
  }

  const handleQuantityChange = (itemId: string, nextQuantity: number) => {
    if (isReadOnly) return
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
    if (isReadOnly) return
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleUnitChange = (itemId: string, newUnitId: string) => {
    if (isReadOnly) return
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

      // Cap current quantity to max available in the new unit
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
    if (isReadOnly) return
    setItems([])
  }, [isReadOnly])

  const handlePaymentMethodChange = useCallback(
    (value: PaymentMethod) => {
      setPaymentMethod(value)
      if (value === 'TRANSFER') {
        setPaidAmount(totals.total)
        setCashReceived(0)
      }
    },
    [totals.total]
  )

  // ── Initialize from existing order ──────────────────────────
  const initializeFromOrder = useCallback((params: {
    mappedItems: SaleOrderItem[]
    status: SaleOrder['status']
    customerId: string
    discount: number
    paidAmount: number
    notes: string
    locationId: string | null
  }) => {
    setItems(params.mappedItems)
    setCustomerId(params.customerId)
    setOrderDiscount(params.discount)
    setPaidAmount(params.paidAmount)
    setCashReceived(params.paidAmount)
    setNotes(params.notes)
    setSelectedLocationId(params.locationId)
    setPaymentMethod(
      params.status === '2_COMPLETE'
        ? params.paidAmount > 0
          ? 'CASH'
          : 'TRANSFER'
        : 'CASH'
    )
    // Sync subtotal ref so the discount reset effect doesn't fire on init
    const initSubtotal = params.mappedItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice - item.discount,
      0
    )
    prevSubtotalRef.current = initSubtotal
    setHasInitialized(true)
  }, [])

  const resetBatchCache = useCallback(() => { }, [])

  // ── Derived flags ───────────────────────────────────────────
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const saveDraft = () =>
    isEdit ? updateMutation.mutate('1_DRAFT') : createMutation.mutate('1_DRAFT')

  const submit = () =>
    isEdit ? updateMutation.mutate('2_COMPLETE') : createMutation.mutate('2_COMPLETE')

  const cancelOrder = () => {
    if (!isEdit) return
    updateMutation.mutate('9_CANCELLED')
  }

  const resetOrder = useCallback(() => {
    setItems([])
    setCustomerId('')
    setOrderDiscount(0)
    setPaymentMethod('CASH')
    setPaidAmount(0)
    setCashReceived(0)
    setNotes('')
    setHasInitialized(false)
    prevSubtotalRef.current = 0
  }, [])

  return {
    // Data
    items,
    batchesByProductId,
    orderCode,
    orderStatus,
    isReadOnly,  // TODO bỏ
    isEdit, // TODO bỏ 
    isSubmitting,
    hasInitialized,
    productIds,
    // Form state + setters
    customerId,
    setCustomerId,
    selectedLocationId,
    setSelectedLocationId,
    orderDiscount,
    setOrderDiscount,
    paymentMethod,
    setPaymentMethod: handlePaymentMethodChange,
    paidAmount,
    setPaidAmount,
    cashReceived,
    setCashReceived,
    bankAccountId,
    setBankAccountId,
    notes,
    setNotes,
    isAddCustomerOpen,
    setIsAddCustomerOpen,
    // Computed
    totals,
    changeAmount,
    debtAmount,
    // Actions
    addProduct,
    updateItem,
    handleQuantityChange,
    handleUnitChange,
    removeItem,
    resetItems,
    saveDraft,
    submit,
    cancelOrder,
    resetOrder,
    initializeFromOrder,
    resetBatchCache,
    setInventoryBatches,
  }
}
