import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { inventoryBatchesRepo, saleOrdersRepo } from '@/client'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'
import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { type SaleOrder } from '@/services/supabase/database/repo/saleOrdersRepo'
import { type PaymentMethod, type SaleOrderItem, getDefaultUnit } from '../data/types'
import {
  allocateQuantityToBatches,
  getAllocatedByBatch,
  getNextAvailableBatch,
} from '../data/inventory-helpers'

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
}

export function useSaleOrder({
  tenantId,
  userId,
  orderId,
  userLocationId,
  orderDetail,
  navigate,
}: UseSaleOrderParams) {
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
  const [prefetchedBatchesByProductId, setPrefetchedBatchesByProductId] = useState<
    Record<string, InventoryBatch[]>
  >({})

  // ── Derived / computed ──────────────────────────────────────
  const generatedOrderCode = useMemo(() => {
    const now = new Date()
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`
    const random = Math.floor(100 + Math.random() * 900)
    return `SO-${stamp}-${random}`
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
    const map: Record<string, InventoryBatch[]> = { ...prefetchedBatchesByProductId }
    const grouped = inventoryBatches.reduce<Record<string, InventoryBatch[]>>((acc, batch) => {
      if (!acc[batch.product_id]) acc[batch.product_id] = []
      acc[batch.product_id].push(batch)
      return acc
    }, {})

    Object.entries(grouped).forEach(([productId, batches]) => {
      map[productId] = batches
    })
    return map
  }, [inventoryBatches, prefetchedBatchesByProductId])

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice - item.discount,
      0
    )
    const total = Math.max(0, subtotal - orderDiscount)
    return { subtotal, total }
  }, [items, orderDiscount])

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
  }, [paymentMethod, totals.total])

  const debtAmount = useMemo(
    () => Math.max(0, totals.total - normalizedPaidAmount),
    [normalizedPaidAmount, totals.total]
  )

  // ── Validation ──────────────────────────────────────────────
  const validateOrder = () => {
    if (!tenantId || !userId) throw new Error('Thiếu thông tin người dùng.')
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
      return await saleOrdersRepo.createSaleOrderWithItems({
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
      })
    },
    onSuccess: (order) => {
      toast.success('Đã tạo đơn bán hàng.')
      navigate({ search: { orderId: order.id } })
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
    onSuccess: () => {
      toast.success('Đã cập nhật đơn bán hàng.')
      navigate({ to: '/' })
    },
    onError: handleMutationError,
  })

  // ── Item actions ────────────────────────────────────────────
  const addProduct = async (product: ProductWithUnits) => {
    if (isReadOnly || !tenantId) return
    const defaultUnit = getDefaultUnit(product)
    const unitPrice = defaultUnit?.sell_price ?? 0

    let batches = batchesByProductId[product.id]

    if (!batches || batches.length === 0) {
      try {
        const fetched = await inventoryBatchesRepo.getInventoryBatchesByProductIds({
          tenantId,
          productIds: [product.id],
          locationId: selectedLocationId,
        })
        batches = fetched
        setPrefetchedBatchesByProductId((prev) => ({ ...prev, [product.id]: fetched }))
      } catch (error) {
        const message =
          error && typeof error === 'object' && 'message' in error
            ? String((error as { message: string }).message)
            : 'Không thể kiểm tra tồn kho.'
        toast.error(message)
        return
      }
    }

    setItems((prev) => {
      const allocations = getAllocatedByBatch(product.id, prev)
      const nextBatch = batches ? getNextAvailableBatch(batches, allocations) : null

      if (!nextBatch) {
        toast.error(`Sản phẩm ${product.product_name} đã hết tồn kho.`)
        return prev
      }

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
        },
      ]
    })
  }

  const updateItem = (itemId: string, next: Partial<SaleOrderItem>) => {
    if (isReadOnly) return
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...next } : item)))
  }

  const handleQuantityChange = (itemId: string, nextQuantity: number) => {
    if (isReadOnly) return
    setItems((prev) => {
      const target = prev.find((item) => item.id === itemId)
      if (!target) return prev

      const batches = batchesByProductId[target.product.id] ?? []
      if (batches.length === 0) {
        toast.error('Không tìm thấy tồn kho cho sản phẩm này.')
        return prev
      }

      const totalStock = batches.reduce((sum, batch) => sum + (batch.quantity ?? 0), 0)
      const allocatedOther = prev
        .filter((item) => item.product.id === target.product.id && item.id !== target.id)
        .reduce((sum, item) => sum + item.quantity, 0)
      const maxForItem = Math.max(0, totalStock - allocatedOther)
      const desired = Math.max(1, Math.floor(nextQuantity || 1))

      if (Math.min(desired, maxForItem) < desired) {
        toast.error('Số lượng vượt quá tồn kho hiện tại.')
      }

      return allocateQuantityToBatches({ target, desired, batches, allItems: prev })
    })
  }

  const removeItem = (itemId: string) => {
    if (isReadOnly) return
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handlePaymentMethodChange = useCallback(
    (value: PaymentMethod) => {
      setPaymentMethod(value)
      if (value === 'TRANSFER') {
        setPaidAmount(totals.total)
      }
    },
    [totals.total]
  )

  // ── Initialize from existing order ──────────────────────────
  const initializeFromOrder = useCallback((params: {
    mappedItems: SaleOrderItem[]
    customerId: string
    discount: number
    paidAmount: number
    notes: string
    locationId: string | null
    prefetchedBatches: Record<string, InventoryBatch[]>
  }) => {
    setItems(params.mappedItems)
    setCustomerId(params.customerId)
    setOrderDiscount(params.discount)
    setPaidAmount(params.paidAmount)
    setCashReceived(params.paidAmount)
    setNotes(params.notes)
    setSelectedLocationId(params.locationId)
    setPaymentMethod('TRANSFER')
    if (Object.keys(params.prefetchedBatches).length > 0) {
      setPrefetchedBatchesByProductId((prev) => ({ ...prev, ...params.prefetchedBatches }))
    }
    setHasInitialized(true)
  }, [])

  const resetBatchCache = useCallback(() => setPrefetchedBatchesByProductId({}), [])

  // ── Derived flags ───────────────────────────────────────────
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const saveDraft = () =>
    isEdit ? updateMutation.mutate('1_DRAFT') : createMutation.mutate('1_DRAFT')

  const submit = () =>
    isEdit ? updateMutation.mutate('2_COMPLETE') : createMutation.mutate('2_COMPLETE')

  return {
    // Data
    items,
    orderCode,
    orderStatus,
    isReadOnly,
    isEdit,
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
    removeItem,
    saveDraft,
    submit,
    initializeFromOrder,
    resetBatchCache,
    setInventoryBatches,
  }
}
