import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Printer } from 'lucide-react'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import {
  getLocationsQueryOptions,
  getPurchaseOrderDetailQueryOptions,
  getProductsQueryOptions,
  getSuppliersQueryOptions,
} from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { PrintPreviewDialog } from '@/components/print-preview-dialog'
import type { OrderItem } from './data/types'
import { PurchaseOrdersItems } from './components/purchase-orders-items'
import { PurchaseOrdersMeta } from './components/purchase-orders-meta'
import { PurchaseOrdersSearch } from './components/purchase-orders-search'
import { PurchaseOrdersSummary } from './components/purchase-orders-summary'
import { PurchaseOrderInvoice } from './components/purchase-order-invoice'
import { usePurchaseOrder } from './hooks/use-purchase-order'

const route = getRouteApi('/_authenticated/purchase-orders/')

export function PurchaseOrders() {
  const { orderId } = route.useSearch()
  const navigate = route.useNavigate()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const userId = user?.profile?.id ?? ''
  const { selectedLocationId: sidebarLocationId } = useLocationContext()
  const userLocationId = sidebarLocationId ?? user?.location?.id ?? null

  // ── Queries ─────────────────────────────────────────────────
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

  const order = usePurchaseOrder({
    tenantId,
    userId,
    orderId,
    userLocationId,
    orderDetail: orderDetail ?? undefined,
    navigate,
  })

  // ── Effects ─────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId || isOrderLoading) return
    if (!orderDetail) {
      toast.error('Không tìm thấy đơn nhập hàng.')
      navigate({ to: '/purchase-orders/history' })
    }
  }, [orderDetail, orderId, isOrderLoading, navigate])

  useEffect(() => {
    if (!orderDetail || order.hasInitialized || products.length === 0) return

    const productLookup = new Map(products.map((p) => [p.id, p]))
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

    order.initializeFromOrder({
      mappedItems,
      supplierId: orderDetail.supplier_id,
      discount: orderDetail.discount ?? 0,
      paidAmount: orderDetail.paid_amount ?? 0,
      paymentStatus: orderDetail.payment_status,
      notes: orderDetail.notes ?? '',
      locationId: orderDetail.location_id ?? userLocationId,
    })
  }, [orderDetail, order.hasInitialized, products, userLocationId, orderId])

  const [pendingBatchItemId, setPendingBatchItemId] = useState<string | null>(null)

  const handleAddProduct = (product: Parameters<typeof order.addProduct>[0]) => {
    const newItemId = order.addProduct(product)
    if (newItemId) setPendingBatchItemId(newItemId)
  }

  // ── Print ──────────────────────────────────────────────────
  const [printOpen, setPrintOpen] = useState(false)

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === order.selectedLocationId) ?? null,
    [locations, order.selectedLocationId]
  )

  const supplierName = useMemo(() => {
    if (!order.supplierId) return undefined
    return suppliers.find((s) => s.id === order.supplierId)?.name ?? undefined
  }, [suppliers, order.supplierId])

  // ── Render ──────────────────────────────────────────────────
  const isLoadingEditData =
    Boolean(orderId) && (!orderDetail || !order.hasInitialized || isOrderLoading)

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-4'>
          <PurchaseOrdersSearch
            products={products}
            onAddProduct={handleAddProduct}
            readOnly={order.isItemsReadOnly}
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='ml-auto shrink-0 gap-2'
            onClick={() => setPrintOpen(true)}
          >
            <Printer className='size-4' />
            In phiếu nhập
          </Button>
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
                locationId={order.selectedLocationId ?? ''}
                onLocationChange={(value) => order.setSelectedLocationId(value)}
                locationDisabled={order.isReadOnly}
                orderCode={order.orderCode}
                status={order.orderStatus}
              />

              <PurchaseOrdersItems
                items={order.items}
                onUpdateItem={order.updateItem}
                onRemoveItem={order.removeItem}
                tenantId={tenantId}
                locationId={order.selectedLocationId}
                pendingBatchItemId={pendingBatchItemId}
                onPendingBatchHandled={() => setPendingBatchItemId(null)}
                readOnly={order.isItemsReadOnly}
              />
            </div>

            <PurchaseOrdersSummary
              suppliers={suppliers}
              supplierId={order.supplierId}
              onSupplierChange={order.setSupplierId}
              totals={order.totals}
              orderDiscount={order.orderDiscount}
              onOrderDiscountChange={order.setOrderDiscount}
              paymentStatus={order.paymentStatus}
              onPaymentStatusChange={order.setPaymentStatus}
              paidAmount={order.paidAmount}
              onPaidAmountChange={order.setPaidAmount}
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

      <PrintPreviewDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        title='Xem trước phiếu nhập'
        documentTitle={order.orderCode}
      >
        <PurchaseOrderInvoice
          orderCode={order.orderCode}
          storeName={selectedLocation?.name}
          storeAddress={selectedLocation?.address ?? undefined}
          storePhone={selectedLocation?.phone ?? undefined}
          supplierName={supplierName}
          items={order.items}
          totals={order.totals}
          orderDiscount={order.orderDiscount}
          paidAmount={order.paidAmount}
          notes={order.notes}
        />
      </PrintPreviewDialog>
    </>
  )
}
