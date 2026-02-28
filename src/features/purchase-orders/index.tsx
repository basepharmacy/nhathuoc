import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useUser } from '@/client/provider'
import {
  getInventoryBatchesQueryOptions,
  getLocationsQueryOptions,
  getPurchaseOrderDetailQueryOptions,
  getProductsQueryOptions,
  getSuppliersQueryOptions,
} from '@/client/queries'
import { purchaseOrdersRepo } from '@/client'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'
import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { type PurchaseOrder } from '@/services/supabase/database/repo/purchaseOrdersRepo'
import { type OrderItem, type PaymentStatus, getDefaultUnit } from './data/types'
import { PurchaseOrdersItems } from './components/purchase-orders-items'
import { PurchaseOrdersMeta } from './components/purchase-orders-meta'
import { PurchaseOrdersSearch } from './components/purchase-orders-search'
import { PurchaseOrdersSummary } from './components/purchase-orders-summary'

const route = getRouteApi('/_authenticated/purchase-orders/')

export function PurchaseOrders() {
  const { orderId } = route.useSearch()
  const navigate = route.useNavigate()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const userId = user?.profile?.id ?? ''
  // TODO: Chuyển lại thành active location khi chọn location ở sidebar
  const userLocationId = user?.location?.id ?? null
  const isEdit = Boolean(orderId)

  // Form state
  const [items, setItems] = useState<OrderItem[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('1_UNPAID')
  const [notes, setNotes] = useState('')
  const [hasInitialized, setHasInitialized] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    userLocationId
  )

  // Data fetching
  const { data: orderDetail, isLoading: isOrderLoading } = useQuery({
    ...getPurchaseOrderDetailQueryOptions(tenantId, orderId ?? ''),
    enabled: !!tenantId && !!orderId,
  })

  const { data: products = [] } = useQuery({
    ...getProductsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: suppliers = [] } = useQuery({
    ...getSuppliersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })


  const generatedOrderCode = useMemo(() => {
    const now = new Date()
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`
    const random = Math.floor(100 + Math.random() * 900)
    return `PN-${stamp}-${random}`
  }, [])

  const orderCode = isEdit
    ? orderDetail?.purchase_order_code ?? ''
    : generatedOrderCode

  const editableStatuses = useMemo<PurchaseOrder['status'][]>(
    () => ['1_DRAFT', '2_ORDERED'],
    []
  )
  const orderStatus = orderDetail?.status ?? '1_DRAFT'
  const isOrdered = orderStatus === '2_ORDERED'
  const isReadOnly = orderStatus !== '1_DRAFT' && orderStatus !== '2_ORDERED'
  const isItemsReadOnly = orderStatus !== '1_DRAFT'

  const productIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.product.id))).sort(),
    [items]
  )

  const { data: inventoryBatches = [] } = useQuery({
    ...getInventoryBatchesQueryOptions(tenantId, productIds, selectedLocationId),
    enabled: !!tenantId && productIds.length > 0,
  })

  const batchesByProductId = useMemo(() => {
    return inventoryBatches.reduce<Record<string, InventoryBatch[]>>((acc, batch) => {
      if (!acc[batch.product_id]) {
        acc[batch.product_id] = []
      }
      acc[batch.product_id].push(batch)
      return acc
    }, {})
  }, [inventoryBatches])

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice - item.discount,
      0
    )
    const total = Math.max(0, subtotal - orderDiscount)
    const debt = Math.max(0, total - paidAmount)
    return { subtotal, total, debt }
  }, [items, orderDiscount, paidAmount])

  const validateOrder = () => {
    if (!tenantId || !userId) {
      throw new Error('Thiếu thông tin người dùng.')
    }
    if (!supplierId) {
      throw new Error('Vui lòng chọn nhà cung cấp.')
    }
    if (items.length === 0) {
      throw new Error('Vui lòng thêm ít nhất 1 sản phẩm.')
    }
  }

  const createMutation = useMutation({
    mutationFn: async (status: '1_DRAFT' | '2_ORDERED') => {
      validateOrder()

      const normalizedPaid = Math.min(paidAmount, totals.total)
      const normalizedStatus: PaymentStatus =
        normalizedPaid <= 0
          ? '1_UNPAID'
          : normalizedPaid >= totals.total
            ? '3_PAID'
            : '2_PARTIALLY_PAID'
      return await purchaseOrdersRepo.createPurchaseOrderWithItems({
        order: {
          purchase_order_code: orderCode,
          supplier_id: supplierId,
          tenant_id: tenantId,
          user_id: userId,
          location_id: selectedLocationId,
          issued_at: new Date().toISOString(),
          status,
          payment_status: normalizedStatus,
          paid_amount: normalizedPaid,
          discount: orderDiscount,
          total_amount: totals.total,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
        items: items.map((item) => ({
          tenant_id: tenantId,
          product_id: item.product.id,
          product_unit_id: item.productUnitId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          batch_code: item.batchCode || undefined,
          expiry_date: item.expiryDate || undefined,
        })),
      })
    },
    onSuccess: (order) => {
      toast.success('Đã tạo đơn nhập hàng.')
      navigate({ search: { orderId: order.id } })
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Đã xảy ra lỗi, vui lòng thử lại.'
      toast.error(message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (status: '1_DRAFT' | '2_ORDERED' | '4_STORED') => {
      if (!orderId || !orderDetail) {
        throw new Error('Không tìm thấy đơn nhập hàng.')
      }
      validateOrder()

      const normalizedPaid = Math.min(paidAmount, totals.total)
      const normalizedStatus: PaymentStatus =
        normalizedPaid <= 0
          ? '1_UNPAID'
          : normalizedPaid >= totals.total
            ? '3_PAID'
            : '2_PARTIALLY_PAID'

      await purchaseOrdersRepo.updatePurchaseOrderWithItems({
        orderId: orderDetail.id,
        tenantId,
        order: {
          supplier_id: supplierId,
          status,
          payment_status: normalizedStatus,
          paid_amount: normalizedPaid,
          discount: orderDiscount,
          total_amount: totals.total,
          location_id: selectedLocationId,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
        items: items.map((item) => ({
          tenant_id: tenantId,
          product_id: item.product.id,
          product_unit_id: item.productUnitId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          batch_code: item.batchCode || undefined,
          expiry_date: item.expiryDate || undefined,
        })),
      })
    },
    onSuccess: () => {
      toast.success('Đã cập nhật đơn nhập hàng.')
      navigate({ to: '/purchase-orders/history' })
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Đã xảy ra lỗi, vui lòng thử lại.'
      toast.error(message)
    },
  })

  const addProduct = (product: ProductWithUnits) => {
    if (isItemsReadOnly) return
    const defaultUnit = getDefaultUnit(product)
    const unitPrice = defaultUnit?.cost_price ?? 0

    setItems((prev) => [
      ...prev,
      {
        id: `${product.id}-${Date.now()}`,
        product,
        productUnitId: defaultUnit?.id ?? null,
        quantity: 1,
        unitPrice,
        discount: 0,
        batchCode: '',
        expiryDate: '',
      },
    ])
  }

  const updateItem = (itemId: string, next: Partial<OrderItem>) => {
    if (isItemsReadOnly) return
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...next } : item)))
  }

  const removeItem = (itemId: string) => {
    if (isItemsReadOnly) return
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  useEffect(() => {
    if (!orderId || isOrderLoading) return

    if (!orderDetail) {
      toast.error('Không tìm thấy đơn nhập hàng.')
      navigate({ to: '/purchase-orders/history' })
      return
    }

  }, [editableStatuses, orderDetail, orderId, isOrderLoading, navigate])

  useEffect(() => {
    if (!orderDetail || hasInitialized || products.length === 0) return

    const productLookup = new Map(products.map((product) => [product.id, product]))
    const mappedItems = (orderDetail.items ?? [])
      .map((item) => {
        const product = productLookup.get(item.product_id)
        if (!product) return null
        return {
          id: String(item.id),
          product,
          productUnitId: item.product_unit_id ?? null,
          quantity: item.quantity ?? 0,
          unitPrice: item.unit_price ?? 0,
          discount: item.discount ?? 0,
          batchCode: item.batch_code ?? '',
          expiryDate: item.expiry_date ?? '',
        }
      })
      .filter((item): item is OrderItem => Boolean(item))

    setItems(mappedItems)
    setSupplierId(orderDetail.supplier_id)
    setOrderDiscount(orderDetail.discount ?? 0)
    setPaidAmount(orderDetail.paid_amount ?? 0)
    setPaymentStatus(orderDetail.payment_status)
    setNotes(orderDetail.notes ?? '')
    setSelectedLocationId(orderDetail.location_id ?? userLocationId)
    setHasInitialized(true)
  }, [orderDetail, hasInitialized, products, userLocationId])

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isLoadingEditData = isEdit && (!orderDetail || !hasInitialized || isOrderLoading)

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-4'>
          <PurchaseOrdersSearch
            products={products}
            onAddProduct={addProduct}
            readOnly={isItemsReadOnly}
          />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {isLoadingEditData ? (
          <div className='flex items-center justify-center py-10 text-muted-foreground'>
            Đang tải...
          </div>
        ) : (
          <div className='grid min-h-[calc(100svh-200px)] gap-4 lg:grid-cols-[minmax(0,1fr)_320px]'>
            <div className='flex flex-col gap-4'>
              <PurchaseOrdersMeta
                locations={locations}
                locationId={selectedLocationId ?? ''}
                onLocationChange={(value) => setSelectedLocationId(value)}
                locationDisabled={isReadOnly}
                orderCode={orderCode}
                status={orderStatus}
              />

              <PurchaseOrdersItems
                items={items}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
                batchesByProductId={batchesByProductId}
                readOnly={isItemsReadOnly}
              />
            </div>

            <PurchaseOrdersSummary
              suppliers={suppliers}
              supplierId={supplierId}
              onSupplierChange={setSupplierId}
              totals={totals}
              orderDiscount={orderDiscount}
              onOrderDiscountChange={setOrderDiscount}
              paymentStatus={paymentStatus}
              onPaymentStatusChange={setPaymentStatus}
              paidAmount={paidAmount}
              onPaidAmountChange={setPaidAmount}
              notes={notes}
              onNotesChange={setNotes}
              orderStatus={orderStatus}
              onSaveDraft={() =>
                isEdit ? updateMutation.mutate('1_DRAFT') : createMutation.mutate('1_DRAFT')
              }
              onSubmit={() =>
                isEdit
                  ? updateMutation.mutate(isOrdered ? '4_STORED' : '2_ORDERED')
                  : createMutation.mutate('2_ORDERED')
              }
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </Main>
    </>
  )
}
