import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productsRepo, purchaseOrdersRepo } from '@/client'
import { mapSupabaseError } from '@/lib/error-mapper'
import { type ProductWithUnits, PurchaseOrderStatus } from '@/services/supabase/'
import { type OrderItem, type PaymentStatus, getBiggestConversionUnit } from '../data/types'

type UsePurchaseOrderParams = {
  tenantId: string
  userId: string
  orderCode?: string
  userLocationId: string | null
  orderDetail?: {
    id: string
    purchase_order_code: string | null
    status: PurchaseOrderStatus
    supplier_id: string | null
    discount: number | null
    paid_amount: number | null
    payment_status: PaymentStatus
    notes: string | null
    location_id: string | null
  }
  onOrderSuccess?: (orderCode: string, status: '1_DRAFT' | '2_ORDERED') => void
}

export function usePurchaseOrder({
  tenantId,
  userId,
  orderCode: orderCodeParam,
  userLocationId,
  orderDetail,
  onOrderSuccess,
}: UsePurchaseOrderParams) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(orderCodeParam)

  // ── Form state ──────────────────────────────────────────────
  const [items, setItems] = useState<OrderItem[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [hasInitialized, setHasInitialized] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(userLocationId)
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)

  // ── Derived / computed ──────────────────────────────────────
  const generatedOrderCode = useMemo(() => {
    const timestamp = Date.now()
    const encoded = timestamp.toString(36).toUpperCase()
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

  const orderStatus: PurchaseOrderStatus = orderDetail?.status ?? '1_DRAFT'

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
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
      return { subtotal, total, debt: total }
    },
    [subtotal, orderDiscount]
  )

  // ── Validation ──────────────────────────────────────────────
  const validateOrder = () => {
    if (!tenantId || !userId) throw new Error('Thiếu thông tin người dùng.')
    if (!selectedLocationId) throw new Error('Vui lòng chọn cửa hàng.')
    if (!supplierId) throw new Error('Vui lòng chọn nhà cung cấp.')
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
      batch_code: item.batchCode || undefined,
      expiry_date: item.expiryDate || undefined,
    }))

  const handleMutationError = (error: unknown) => {
    toast.error(mapSupabaseError(error))
  }

  const updateCostPricesForNullItems = async (): Promise<boolean> => {
    const updates: Array<{ unitId: string; costPrice: number }> = []
    console.log('items to check for cost price update', items)
    for (const item of items) {
      if (!item.productUnitId || item.unitPrice <= 0) continue
      const units = item.product.product_units ?? []
      const orderedUnit = units.find((u) => u.id === item.productUnitId)
      if (!orderedUnit || orderedUnit.cost_price !== null) continue

      const orderedCF = orderedUnit.conversion_factor || 1
      for (const u of units) {
        if (u.cost_price === null) {
          const costPrice = Math.round(item.unitPrice * (u.conversion_factor || 1) / orderedCF)
          updates.push({ unitId: u.id, costPrice })
        }
      }
    }

    if (updates.length === 0) return false

    await Promise.all(
      updates.map((u) => productsRepo.updateProductUnitCostPrice(u.unitId, u.costPrice))
    )
    return true
  }

  const createMutation = useMutation({
    mutationFn: async (status: '1_DRAFT' | '2_ORDERED') => {
      validateOrder()
      const order = await purchaseOrdersRepo.createPurchaseOrderWithItems({
        order: {
          purchase_order_code: orderCode,
          supplier_id: supplierId,
          tenant_id: tenantId,
          user_id: userId,
          location_id: selectedLocationId,
          issued_at: issuedAt,
          status,
          payment_status: '1_UNPAID',
          paid_amount: 0,
          discount: orderDiscount,
          total_amount: totals.total,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
        items: buildOrderItems(),
      })
      const didUpdateCost = await updateCostPricesForNullItems()
      console.log('didUpdateCost', didUpdateCost)
      return { order, didUpdateCost }
    },
    onSuccess: ({ order, didUpdateCost }, status) => {
      if (didUpdateCost) queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      toast.success('Đã tạo đơn nhập hàng.')
      onOrderSuccess?.(order.purchase_order_code ?? '', status)
    },
    onError: handleMutationError,
  })

  const updateMutation = useMutation({
    mutationFn: async (status: '1_DRAFT' | '2_ORDERED') => {
      if (!orderCodeParam || !orderDetail) throw new Error('Không tìm thấy đơn nhập hàng.')
      validateOrder()

      await purchaseOrdersRepo.updatePurchaseOrderWithItems({
        orderId: orderDetail.id,
        tenantId,
        order: {
          supplier_id: supplierId,
          status,
          payment_status: '1_UNPAID',
          paid_amount: 0,
          discount: orderDiscount,
          total_amount: totals.total,
          location_id: selectedLocationId,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
        items: buildOrderItems(),
      })
      const didUpdateCost = await updateCostPricesForNullItems()
      return { didUpdateCost }
    },
    onSuccess: (result, status) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', tenantId] })
      if (result?.didUpdateCost) queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      toast.success('Đã cập nhật đơn nhập hàng.')
      onOrderSuccess?.(orderCodeParam ?? '', status)
    },
    onError: handleMutationError,
  })

  // ── Item actions ────────────────────────────────────────────
  const addProduct = (product: ProductWithUnits): string => {
    if (!selectedLocationId) {
      toast.error('Bạn cần phải chọn cửa hàng.')
      return ''
    }

    const productExists = items.some((item) => item.product.id === product.id)
    if (productExists) {
      toast.error('Sản phẩm này đã có trong đơn hàng.')
      return ''
    }

    const biggestUnit = getBiggestConversionUnit(product)
    const unitPrice = biggestUnit?.cost_price ?? 0
    const newId = `${product.id}-${Date.now()}`

    setItems((prev) => [
      ...prev,
      {
        id: newId,
        product,
        productUnitId: biggestUnit?.id ?? null,
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
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...next } : item)))
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const resetItems = useCallback(() => {
    setItems([])
  }, [])

  // ── Initialize from existing order ──────────────────────────
  const initializeFromOrder = useCallback((params: {
    mappedItems: OrderItem[]
    supplierId: string
    discount: number
    notes: string
    locationId: string | null
  }) => {
    setItems(params.mappedItems)
    setSupplierId(params.supplierId)
    setOrderDiscount(params.discount)
    setNotes(params.notes)
    setSelectedLocationId(params.locationId)
    const initSubtotal = params.mappedItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
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
    isEdit ? updateMutation.mutate('2_ORDERED') : createMutation.mutate('2_ORDERED')

  const resetOrder = useCallback(() => {
    setItems([])
    setSupplierId('')
    setOrderDiscount(0)
    setNotes('')
    setHasInitialized(false)
    prevSubtotalRef.current = 0
    // Generate new order code
    setOrderCode(generatedOrderCode)
    setIssuedAt(new Date().toISOString())
  }, [])

  // Reset form when navigating from edit to create
  const prevOrderCodeRef = useRef(orderCodeParam)
  useEffect(() => {
    if (prevOrderCodeRef.current && !orderCodeParam) {
      resetOrder()
    }
    prevOrderCodeRef.current = orderCodeParam
  }, [orderCodeParam, resetOrder])

  return {
    // Data
    items,
    orderCode,
    orderStatus,
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
