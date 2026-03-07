import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { purchaseOrdersRepo } from '@/client'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'
import { type PurchaseOrder } from '@/services/supabase/database/repo/purchaseOrdersRepo'
import { type OrderItem, type PaymentStatus, getDefaultUnit } from '../data/types'

type UsePurchaseOrderParams = {
  tenantId: string
  userId: string
  orderId?: string
  userLocationId: string | null
  orderDetail?: {
    id: string
    purchase_order_code: string | null
    status: PurchaseOrder['status']
    supplier_id: string
    discount: number | null
    paid_amount: number | null
    payment_status: PaymentStatus
    notes: string | null
    location_id: string | null
  }
  navigate: (opts: { search?: { orderId: string }; to?: string }) => void
}

export function usePurchaseOrder({
  tenantId,
  userId,
  orderId,
  userLocationId,
  orderDetail,
  navigate,
}: UsePurchaseOrderParams) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(orderId)

  // ── Form state ──────────────────────────────────────────────
  const [items, setItems] = useState<OrderItem[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('1_UNPAID')
  const [notes, setNotes] = useState('')
  const [hasInitialized, setHasInitialized] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(userLocationId)
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)

  // ── Derived / computed ──────────────────────────────────────
  const generatedOrderCode = useMemo(() => {
    const timestamp = Date.now()
    const encoded = timestamp.toString(36).toUpperCase() // Convert to base36 for shorter string
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    return `${encoded}P${random}`
  }, [])

  const [orderCode, setOrderCode] = useState('')
  const [issuedAt, setIssuedAt] = useState(new Date().toISOString())

  // Initialize orderCode once
  useEffect(() => {
    if (isEdit) {
      if (orderDetail?.purchase_order_code) {
        setOrderCode(orderDetail.purchase_order_code)
      }
    } else if (!orderCode) {
      setOrderCode(generatedOrderCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, orderDetail?.purchase_order_code, generatedOrderCode])

  const orderStatus: PurchaseOrder['status'] = orderDetail?.status ?? '1_DRAFT'
  const isOrdered = orderStatus === '2_ORDERED'
  const isReadOnly = orderStatus !== '1_DRAFT' && orderStatus !== '2_ORDERED'
  const isItemsReadOnly = orderStatus !== '1_DRAFT'

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
    () => {
      const total = Math.max(0, subtotal - orderDiscount)
      const debt = Math.max(0, total - paidAmount)
      return { subtotal, total, debt }
    },
    [subtotal, orderDiscount, paidAmount]
  )

  // ── Validation ──────────────────────────────────────────────
  const validateOrder = (requireBatch = false) => {
    if (!tenantId || !userId) throw new Error('Thiếu thông tin người dùng.')
    if (!selectedLocationId) throw new Error('Vui lòng chọn cửa hàng.')
    if (!supplierId) throw new Error('Vui lòng chọn nhà cung cấp.')
    if (items.length === 0) throw new Error('Vui lòng thêm ít nhất 1 sản phẩm.')

    if (requireBatch) {
      const itemsWithoutBatch = items.filter((item) => !item.batchCode.trim())
      if (itemsWithoutBatch.length > 0) {
        throw new Error('Vui lòng nhập mã lô cho tất cả sản phẩm.')
      }

      const itemsWithoutExpiry = items.filter((item) => !item.expiryDate.trim())
      if (itemsWithoutExpiry.length > 0) {
        throw new Error('Vui lòng nhập hạn sử dụng cho tất cả sản phẩm.')
      }
    }
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
      batch_code: item.batchCode || undefined,
      expiry_date: item.expiryDate || undefined,
    }))

  const normalizePaymentStatus = (paid: number): PaymentStatus =>
    paid <= 0 ? '1_UNPAID' : paid >= totals.total ? '3_PAID' : '2_PARTIALLY_PAID'

  const handleMutationError = (error: unknown) => {
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'Đã xảy ra lỗi, vui lòng thử lại.'
    toast.error(message)
  }

  const createMutation = useMutation({
    mutationFn: async (status: '1_DRAFT' | '2_ORDERED') => {
      validateOrder(status !== '1_DRAFT')
      const normalizedPaid = Math.min(paidAmount, totals.total)
      return await purchaseOrdersRepo.createPurchaseOrderWithItems({
        order: {
          purchase_order_code: orderCode,
          supplier_id: supplierId,
          tenant_id: tenantId,
          user_id: userId,
          location_id: selectedLocationId,
          issued_at: issuedAt,
          status,
          payment_status: normalizePaymentStatus(normalizedPaid),
          paid_amount: normalizedPaid,
          discount: orderDiscount,
          total_amount: totals.total,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
        items: buildOrderItems(),
      })
    },
    onSuccess: (order) => {
      toast.success('Đã tạo đơn nhập hàng.')
      navigate({ search: { orderId: order.id } })
    },
    onError: handleMutationError,
  })

  const updateMutation = useMutation({
    mutationFn: async (status: '1_DRAFT' | '2_ORDERED' | '4_STORED') => {
      if (!orderId || !orderDetail) throw new Error('Không tìm thấy đơn nhập hàng.')
      validateOrder(status !== '1_DRAFT')
      const normalizedPaid = Math.min(paidAmount, totals.total)

      await purchaseOrdersRepo.updatePurchaseOrderWithItems({
        orderId: orderDetail.id,
        tenantId,
        order: {
          supplier_id: supplierId,
          status,
          payment_status: normalizePaymentStatus(normalizedPaid),
          paid_amount: normalizedPaid,
          discount: orderDiscount,
          total_amount: totals.total,
          location_id: selectedLocationId,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
        items: buildOrderItems(),
      })
    },
    onSuccess: (_data, status) => {
      queryClient.invalidateQueries({
        queryKey: ['purchase-orders'],
      })
      if (status === '4_STORED') {
        queryClient.invalidateQueries({
          queryKey: ['dashboard-report', 'low-stock-products'],
        })
      }
      toast.success('Đã cập nhật đơn nhập hàng.')
      if (status === '1_DRAFT') {
        return
      }
      navigate({ to: '/purchase-orders/history' })
    },
    onError: handleMutationError,
  })

  // ── Item actions ────────────────────────────────────────────
  const addProduct = (product: ProductWithUnits): string => {
    if (isItemsReadOnly) return ''
    if (!selectedLocationId) {
      toast.error('Bạn cần phải chọn cửa hàng.')
      return ''
    }

    // Check if product already exists in items
    const productExists = items.some((item) => item.product.id === product.id)
    if (productExists) {
      toast.error('Sản phẩm này đã có trong đơn hàng.')
      return ''
    }

    const defaultUnit = getDefaultUnit(product)
    const unitPrice = defaultUnit?.cost_price ?? 0
    const newId = `${product.id}-${Date.now()}`

    setItems((prev) => [
      ...prev,
      {
        id: newId,
        product,
        productUnitId: defaultUnit?.id ?? null,
        quantity: 1,
        unitPrice,
        discount: 0,
        batchCode: '',
        expiryDate: '',
      },
    ])
    return newId
  }

  const updateItem = (itemId: string, next: Partial<OrderItem>) => {
    if (isItemsReadOnly) return
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...next } : item)))
  }

  const removeItem = (itemId: string) => {
    if (isItemsReadOnly) return
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const resetItems = useCallback(() => {
    if (isItemsReadOnly) return
    setItems([])
  }, [isItemsReadOnly])

  // ── Initialize from existing order ──────────────────────────
  const initializeFromOrder = useCallback((params: {
    mappedItems: OrderItem[]
    supplierId: string
    discount: number
    paidAmount: number
    paymentStatus: PaymentStatus
    notes: string
    locationId: string | null
  }) => {
    setItems(params.mappedItems)
    setSupplierId(params.supplierId)
    setOrderDiscount(params.discount)
    setPaidAmount(params.paidAmount)
    setPaymentStatus(params.paymentStatus)
    setNotes(params.notes)
    setSelectedLocationId(params.locationId)
    // Sync subtotal ref so the discount reset effect doesn't fire on init
    const initSubtotal = params.mappedItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice - item.discount,
      0
    )
    prevSubtotalRef.current = initSubtotal
    setHasInitialized(true)
  }, [])

  // ── Derived flags ───────────────────────────────────────────
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const saveDraft = () =>
    isEdit ? updateMutation.mutate('1_DRAFT') : createMutation.mutate('1_DRAFT')

  const submit = () =>
    isEdit
      ? updateMutation.mutate(isOrdered ? '4_STORED' : '2_ORDERED')
      : createMutation.mutate('2_ORDERED')

  const resetOrder = useCallback(() => {
    setItems([])
    setSupplierId('')
    setOrderDiscount(0)
    setPaidAmount(0)
    setPaymentStatus('1_UNPAID')
    setNotes('')
    setHasInitialized(false)
    prevSubtotalRef.current = 0
    // Generate new order code
    const ts = Date.now()
    const enc = ts.toString(36).toUpperCase()
    const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    setOrderCode(`${enc}-${rnd}`)
    setIssuedAt(new Date().toISOString())
  }, [])

  // Reset form when navigating from edit to create
  const prevOrderIdRef = useRef(orderId)
  useEffect(() => {
    if (prevOrderIdRef.current && !orderId) {
      resetOrder()
    }
    prevOrderIdRef.current = orderId
  }, [orderId, resetOrder])

  return {
    // Data
    items,
    orderCode,
    orderStatus,
    isReadOnly,
    isItemsReadOnly,
    isEdit,
    isSubmitting,
    hasInitialized,

    // Form state + setters
    setOrderCode,
    issuedAt,
    setIssuedAt,
    supplierId,
    setSupplierId,
    isAddSupplierOpen,
    setIsAddSupplierOpen,
    selectedLocationId,
    setSelectedLocationId,
    orderDiscount,
    setOrderDiscount,
    paidAmount,
    setPaidAmount,
    paymentStatus,
    setPaymentStatus,
    notes,
    setNotes,
    // Computed
    totals,
    // Actions
    addProduct,
    updateItem,
    removeItem,
    resetItems,
    saveDraft,
    submit,
    resetOrder,
    initializeFromOrder,
  }
}
