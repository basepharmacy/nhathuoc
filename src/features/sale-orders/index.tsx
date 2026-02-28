import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useUser } from '@/client/provider'
import {
  getCustomersQueryOptions,
  getInventoryBatchesQueryOptions,
  getLocationsQueryOptions,
  getProductsQueryOptions,
  getSaleOrderDetailQueryOptions,
} from '@/client/queries'
import { inventoryBatchesRepo, saleOrdersRepo } from '@/client'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'
import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { type SaleOrder } from '@/services/supabase/database/repo/saleOrdersRepo'
import { type PaymentMethod, type SaleOrderItem, getDefaultUnit } from './data/types'
import { SaleOrdersItems } from './components/sale-orders-items'
import { SaleOrdersMeta } from './components/sale-orders-meta'
import { SaleOrdersSearch } from './components/sale-orders-search'
import { SaleOrdersSummary } from './components/sale-orders-summary'
import { CustomersActionDialog } from '@/features/customers/components/customers-action-dialog'

const route = getRouteApi('/_authenticated/sale-orders/')

const getBatchQuantity = (batch: InventoryBatch) => batch.quantity ?? 0

export function SaleOrders() {
  const { orderId } = route.useSearch()
  const navigate = route.useNavigate()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const userId = user?.profile?.id ?? ''
  const userLocationId = user?.location?.id ?? null
  const isEdit = Boolean(orderId)

  const [items, setItems] = useState<SaleOrderItem[]>([])
  const [customerId, setCustomerId] = useState('')
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [paidAmount, setPaidAmount] = useState(0)
  const [cashReceived, setCashReceived] = useState(0)
  const [notes, setNotes] = useState('')
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    userLocationId
  )
  const [prefetchedBatchesByProductId, setPrefetchedBatchesByProductId] =
    useState<Record<string, InventoryBatch[]>>({})

  const { data: orderDetail, isLoading: isOrderLoading } = useQuery({
    ...getSaleOrderDetailQueryOptions(tenantId, orderId ?? ''),
    enabled: !!tenantId && !!orderId,
  })

  const { data: products = [] } = useQuery({
    ...getProductsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: customers = [] } = useQuery({
    ...getCustomersQueryOptions(tenantId),
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
    return `SO-${stamp}-${random}`
  }, [])

  const orderCode = isEdit ? orderDetail?.sale_order_code ?? '' : generatedOrderCode

  const orderStatus: SaleOrder['status'] = orderDetail?.status ?? '1_DRAFT'
  const isComplete = orderStatus === '2_COMPLETE'
  const isReadOnly = isComplete || orderStatus === '9_CANCELLED'

  const productIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.product.id))).sort(),
    [items]
  )

  const { data: inventoryBatches = [] } = useQuery({
    ...getInventoryBatchesQueryOptions(tenantId, productIds, selectedLocationId),
    enabled: !!tenantId && productIds.length > 0,
  })

  const batchesByProductId = useMemo(() => {
    const map: Record<string, InventoryBatch[]> = { ...prefetchedBatchesByProductId }
    const grouped = inventoryBatches.reduce<Record<string, InventoryBatch[]>>(
      (acc, batch) => {
        if (!acc[batch.product_id]) {
          acc[batch.product_id] = []
        }
        acc[batch.product_id].push(batch)
        return acc
      },
      {}
    )

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
    if (paymentMethod === 'CASH') {
      return Math.min(totals.total, cashReceived)
    }
    return Math.min(totals.total, paidAmount)
  }, [cashReceived, paidAmount, paymentMethod, totals.total])

  const debtAmount = useMemo(
    () => Math.max(0, totals.total - normalizedPaidAmount),
    [normalizedPaidAmount, totals.total]
  )

  const validateOrder = () => {
    if (!tenantId || !userId) {
      throw new Error('Thiếu thông tin người dùng.')
    }
    if (items.length === 0) {
      throw new Error('Vui lòng thêm ít nhất 1 sản phẩm.')
    }
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
        items: items.map((item) => ({
          tenant_id: tenantId,
          product_id: item.product.id,
          product_unit_id: item.productUnitId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          batch_id: item.batchId ?? null,
        })),
      })
    },
    onSuccess: (order) => {
      toast.success('Đã tạo đơn bán hàng.')
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
    mutationFn: async (status: SaleOrder['status']) => {
      if (!orderId || !orderDetail) {
        throw new Error('Không tìm thấy đơn bán hàng.')
      }
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
        items: items.map((item) => ({
          tenant_id: tenantId,
          product_id: item.product.id,
          product_unit_id: item.productUnitId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          batch_id: item.batchId ?? null,
        })),
      })
    },
    onSuccess: () => {
      toast.success('Đã cập nhật đơn bán hàng.')
      navigate({ to: '/' })
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Đã xảy ra lỗi, vui lòng thử lại.'
      toast.error(message)
    },
  })

  const getAllocatedByBatch = (productId: string, rows: SaleOrderItem[]) => {
    const map = new Map<string, number>()
    rows.forEach((row) => {
      if (row.product.id !== productId) return
      if (!row.batchId) return
      map.set(row.batchId, (map.get(row.batchId) ?? 0) + row.quantity)
    })
    return map
  }

  const getNextAvailableBatch = (
    batches: InventoryBatch[],
    allocations: Map<string, number>
  ) => {
    return (
      batches.find((batch) => {
        const available = getBatchQuantity(batch) - (allocations.get(batch.id) ?? 0)
        return available > 0
      }) ?? null
    )
  }

  const addProduct = async (product: ProductWithUnits) => {
    if (isReadOnly) return
    if (!tenantId) return
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
        setPrefetchedBatchesByProductId((prev) => ({
          ...prev,
          [product.id]: fetched,
        }))
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

      const totalStock = batches.reduce((sum, batch) => sum + getBatchQuantity(batch), 0)
      const allocatedOther = prev
        .filter((item) => item.product.id === target.product.id && item.id !== target.id)
        .reduce((sum, item) => sum + item.quantity, 0)

      const maxForItem = Math.max(0, totalStock - allocatedOther)
      const desired = Math.max(1, Math.floor(nextQuantity || 1))
      const capped = Math.min(desired, maxForItem)

      if (capped < desired) {
        toast.error('Số lượng vượt quá tồn kho hiện tại.')
      }

      const allocations = new Map<string, number>()
      prev.forEach((item) => {
        if (item.product.id !== target.product.id) return
        if (item.id === target.id) return
        if (!item.batchId) return
        allocations.set(item.batchId, (allocations.get(item.batchId) ?? 0) + item.quantity)
      })

      let remaining = capped

      const nextItems: SaleOrderItem[] = prev
        .map((item) => {
          if (item.id !== target.id) return item

          const batch = batches.find((entry) => entry.id === item.batchId)
          const available = Math.max(
            0,
            (batch ? getBatchQuantity(batch) : 0) - (allocations.get(item.batchId ?? '') ?? 0)
          )
          const assigned = Math.min(remaining, available)
          remaining -= assigned

          return { ...item, quantity: assigned }
        })
        .filter((item) => item.quantity > 0)

      const startIndex = batches.findIndex((batch) => batch.id === target.batchId)
      const nextBatches = startIndex >= 0 ? batches.slice(startIndex + 1) : batches

      nextBatches.forEach((batch) => {
        if (remaining <= 0) return
        const available = Math.max(0, getBatchQuantity(batch) - (allocations.get(batch.id) ?? 0))
        if (available <= 0) return

        const assigned = Math.min(remaining, available)
        remaining -= assigned

        const existingIndex = nextItems.findIndex(
          (item) => item.product.id === target.product.id && item.batchId === batch.id
        )

        if (existingIndex >= 0) {
          nextItems[existingIndex] = {
            ...nextItems[existingIndex],
            quantity: nextItems[existingIndex].quantity + assigned,
          }
          return
        }

        nextItems.push({
          id: `${target.product.id}-${batch.id}-${Date.now()}`,
          product: target.product,
          productUnitId: target.productUnitId,
          quantity: assigned,
          unitPrice: target.unitPrice,
          discount: 0,
          batchId: batch.id,
          batchCode: batch.batch_code ?? '',
          expiryDate: batch.expiry_date ?? '',
        })
      })

      return nextItems
    })
  }

  const removeItem = (itemId: string) => {
    if (isReadOnly) return
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  useEffect(() => {
    if (!orderId || isOrderLoading) return

    if (!orderDetail) {
      toast.error('Không tìm thấy đơn bán hàng.')
      navigate({ to: '/' })
      return
    }
  }, [orderDetail, orderId, isOrderLoading, navigate])

  useEffect(() => {
    if (!orderDetail || hasInitialized || products.length === 0) return

    let isActive = true

    const load = async () => {
      const productLookup = new Map(products.map((product) => [product.id, product]))
      const orderProductIds = Array.from(
        new Set((orderDetail.items ?? []).map((item) => item.product_id))
      )

      let batches: InventoryBatch[] = []
      if (orderProductIds.length > 0) {
        try {
          batches = await inventoryBatchesRepo.getInventoryBatchesByProductIds({
            tenantId,
            productIds: orderProductIds,
            locationId: orderDetail.location_id ?? userLocationId,
          })
        } catch (error) {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: string }).message)
              : 'Không thể tải tồn kho.'
          toast.error(message)
        }
      }

      if (!isActive) return

      if (batches.length > 0) {
        const grouped = batches.reduce<Record<string, InventoryBatch[]>>((acc, batch) => {
          if (!acc[batch.product_id]) {
            acc[batch.product_id] = []
          }
          acc[batch.product_id].push(batch)
          return acc
        }, {})

        setPrefetchedBatchesByProductId((prev) => ({
          ...prev,
          ...grouped,
        }))
      }

      const batchById = new Map(batches.map((batch) => [batch.id, batch]))

      const mappedItems = (orderDetail.items ?? [])
        .map((item) => {
          const product = productLookup.get(item.product_id)
          if (!product) return null
          const batch = item.batch_id ? batchById.get(item.batch_id) : null
          return {
            id: String(item.id),
            product,
            productUnitId: item.product_unit_id ?? null,
            quantity: item.quantity ?? 0,
            unitPrice: item.unit_price ?? 0,
            discount: item.discount ?? 0,
            batchId: item.batch_id ?? null,
            batchCode: batch?.batch_code ?? '',
            expiryDate: batch?.expiry_date ?? '',
          }
        })
        .filter((item): item is SaleOrderItem => Boolean(item))

      setItems(mappedItems)
      setCustomerId(orderDetail.customer_id ?? '')
      setOrderDiscount(orderDetail.discount ?? 0)
      setPaidAmount(orderDetail.customer_paid_amount ?? 0)
      setCashReceived(orderDetail.customer_paid_amount ?? 0)
      setNotes(orderDetail.notes ?? '')
      setSelectedLocationId(orderDetail.location_id ?? userLocationId)
      setPaymentMethod('TRANSFER')
      setHasInitialized(true)
    }

    void load()

    return () => {
      isActive = false
    }
  }, [
    orderDetail,
    hasInitialized,
    products,
    tenantId,
    userLocationId,
    orderId,
  ])

  useEffect(() => {
    setPrefetchedBatchesByProductId({})
  }, [selectedLocationId])

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isLoadingEditData = isEdit && (!orderDetail || !hasInitialized || isOrderLoading)

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-4'>
          <SaleOrdersSearch
            products={products}
            onAddProduct={addProduct}
            readOnly={isReadOnly}
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
              <SaleOrdersMeta
                locations={locations}
                locationId={selectedLocationId ?? ''}
                onLocationChange={(value) => setSelectedLocationId(value)}
                locationDisabled={isReadOnly}
                orderCode={orderCode}
                status={orderStatus}
              />

              <SaleOrdersItems
                items={items}
                onUpdateItem={updateItem}
                onQuantityChange={handleQuantityChange}
                onRemoveItem={removeItem}
                readOnly={isReadOnly}
              />
            </div>

            <SaleOrdersSummary
              customers={customers}
              customerId={customerId}
              onCustomerChange={setCustomerId}
              onAddCustomer={() => setIsAddCustomerOpen(true)}
              totals={totals}
              orderDiscount={orderDiscount}
              onOrderDiscountChange={setOrderDiscount}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              paidAmount={paidAmount}
              onPaidAmountChange={setPaidAmount}
              cashReceived={cashReceived}
              onCashReceivedChange={setCashReceived}
              changeAmount={changeAmount}
              debtAmount={debtAmount}
              notes={notes}
              onNotesChange={setNotes}
              orderStatus={orderStatus}
              onSaveDraft={() =>
                isEdit ? updateMutation.mutate('1_DRAFT') : createMutation.mutate('1_DRAFT')
              }
              onSubmit={() =>
                isEdit ? updateMutation.mutate('2_COMPLETE') : createMutation.mutate('2_COMPLETE')
              }
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </Main>

      <CustomersActionDialog
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
        onCreated={(customer) => {
          setCustomerId(customer.id)
        }}
      />
    </>
  )
}
