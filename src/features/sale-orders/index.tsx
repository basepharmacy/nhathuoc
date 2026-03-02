import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { inventoryBatchesRepo } from '@/client'
import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { CustomersActionDialog } from '@/features/customers/components/customers-action-dialog'
import { type SaleOrderItem } from './data/types'
import { SaleOrdersItems } from './components/sale-orders-items'
import { SaleOrdersMeta } from './components/sale-orders-meta'
import { SaleOrdersSearch } from './components/sale-orders-search'
import { SaleOrdersSummary } from './components/sale-orders-summary'
import { useSaleOrder } from './hooks/use-sale-order'

const route = getRouteApi('/_authenticated/sale-orders/')
const EMPTY_BATCHES: InventoryBatch[] = []

export function SaleOrders() {
  const { orderId } = route.useSearch()
  const navigate = route.useNavigate()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const userId = user?.profile?.id ?? ''
  const userLocationId = user?.location?.id ?? null

  // ── Queries ─────────────────────────────────────────────────
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

  const order = useSaleOrder({
    tenantId,
    userId,
    orderId,
    userLocationId,
    orderDetail: orderDetail ?? undefined,
    navigate,
  })

  const { data: inventoryBatches = EMPTY_BATCHES } = useQuery({
    ...getInventoryBatchesQueryOptions(tenantId, order.productIds, order.selectedLocationId),
    enabled: !!tenantId && order.productIds.length > 0,
  })

  // ── Effects ─────────────────────────────────────────────────
  useEffect(() => {
    order.setInventoryBatches(inventoryBatches)
  }, [inventoryBatches])

  useEffect(() => {
    order.resetBatchCache()
  }, [order.selectedLocationId])

  useEffect(() => {
    if (!orderId || isOrderLoading) return
    if (!orderDetail) {
      toast.error('Không tìm thấy đơn bán hàng.')
      navigate({ to: '/' })
    }
  }, [orderDetail, orderId, isOrderLoading, navigate])

  useEffect(() => {
    if (!orderDetail || order.hasInitialized || products.length === 0) return

    let isActive = true

    const load = async () => {
      const productLookup = new Map(products.map((p) => [p.id, p]))
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

      const grouped = batches.reduce<Record<string, InventoryBatch[]>>((acc, batch) => {
        if (!acc[batch.product_id]) acc[batch.product_id] = []
        acc[batch.product_id].push(batch)
        return acc
      }, {})

      const batchById = new Map(batches.map((b) => [b.id, b]))

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

      order.initializeFromOrder({
        mappedItems,
        customerId: orderDetail.customer_id ?? '',
        discount: orderDetail.discount ?? 0,
        paidAmount: orderDetail.customer_paid_amount ?? 0,
        notes: orderDetail.notes ?? '',
        locationId: orderDetail.location_id ?? userLocationId,
        prefetchedBatches: grouped,
      })
    }

    void load()
    return () => { isActive = false }
  }, [orderDetail, order.hasInitialized, products, tenantId, userLocationId, orderId])

  // ── Render ──────────────────────────────────────────────────
  const isLoadingEditData = Boolean(orderId) && (!orderDetail || !order.hasInitialized || isOrderLoading)

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-4'>
          <SaleOrdersSearch
            products={products}
            onAddProduct={order.addProduct}
            readOnly={order.isReadOnly}
          />
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
                locationId={order.selectedLocationId ?? ''}
                onLocationChange={(value) => order.setSelectedLocationId(value)}
                locationDisabled={order.isReadOnly}
                orderCode={order.orderCode}
                status={order.orderStatus}
              />

              <SaleOrdersItems
                items={order.items}
                onUpdateItem={order.updateItem}
                onQuantityChange={order.handleQuantityChange}
                onRemoveItem={order.removeItem}
                readOnly={order.isReadOnly}
              />
            </div>

            <SaleOrdersSummary
              customers={customers}
              customerId={order.customerId}
              onCustomerChange={order.setCustomerId}
              onAddCustomer={() => order.setIsAddCustomerOpen(true)}
              totals={order.totals}
              orderDiscount={order.orderDiscount}
              onOrderDiscountChange={order.setOrderDiscount}
              paymentMethod={order.paymentMethod}
              onPaymentMethodChange={order.setPaymentMethod}
              paidAmount={order.paidAmount}
              onPaidAmountChange={order.setPaidAmount}
              cashReceived={order.cashReceived}
              onCashReceivedChange={order.setCashReceived}
              changeAmount={order.changeAmount}
              debtAmount={order.debtAmount}
              notes={order.notes}
              onNotesChange={order.setNotes}
              orderStatus={order.orderStatus}
              onSaveDraft={order.saveDraft}
              onSubmit={order.submit}
              isSubmitting={order.isSubmitting}
            />
          </div>
        )}
      </Main>

      <CustomersActionDialog
        open={order.isAddCustomerOpen}
        onOpenChange={order.setIsAddCustomerOpen}
        onCreated={(customer) => order.setCustomerId(customer.id)}
      />
    </>
  )
}
