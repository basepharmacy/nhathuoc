import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Printer } from 'lucide-react'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import {
  getCustomersQueryOptions,
  getBankAccountsQueryOptions,
  getInventoryBatchesQueryOptions,
  getLocationsQueryOptions,
  getProductsQueryOptions,
  getSaleOrderDetailQueryOptions,
} from '@/client/queries'
import { inventoryBatchesRepo } from '@/client'
import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PrintPreviewDialog } from '@/components/print-preview-dialog'
import { CustomersActionDialog } from '@/features/customers/components/customers-action-dialog'
import { type SaleOrderItem } from './data/types'
import { SaleOrdersItems } from './components/sale-orders-items'
import { SaleOrdersMeta } from './components/sale-orders-meta'
import { SaleOrdersSearch } from './components/sale-orders-search'
import { SaleOrdersSummary } from './components/sale-orders-summary'
import { SaleOrderInvoice } from './components/sale-order-invoice'
import { useSaleOrder } from './hooks/use-sale-order'

const route = getRouteApi('/_authenticated/sale-orders/')
const EMPTY_BATCHES: InventoryBatch[] = []

export function SaleOrders() {
  const { orderId } = route.useSearch()
  const navigate = route.useNavigate()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const userId = user?.profile?.id ?? ''
  const { selectedLocationId: sidebarLocationId } = useLocationContext()
  const userLocationId = sidebarLocationId ?? null

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

  const { data: bankAccounts = [] } = useQuery({
    ...getBankAccountsQueryOptions(tenantId),
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
    if (order.selectedLocationId || locations.length === 0) return
    order.setSelectedLocationId(sidebarLocationId ?? locations[0].id)
  }, [order.selectedLocationId, locations, sidebarLocationId, order.setSelectedLocationId])

  useEffect(() => {
    if (!orderId || isOrderLoading) return
    if (!orderDetail) {
      toast.error('Không tìm thấy đơn bán hàng.')
      navigate({ to: '/' })
    }
  }, [orderDetail, orderId, isOrderLoading, navigate])

  useEffect(() => {
    if (order.bankAccountId || bankAccounts.length === 0) return
    const defaultAccount = bankAccounts.find((account) => account.is_default) ?? bankAccounts[0]
    if (defaultAccount) {
      order.setBankAccountId(defaultAccount.id)
    }
  }, [bankAccounts, order.bankAccountId, order.setBankAccountId])

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
        status: orderDetail.status,
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

  // ── Print ──────────────────────────────────────────────────
  const [printOpen, setPrintOpen] = useState(false)
  const [locationConfirmOpen, setLocationConfirmOpen] = useState(false)
  const [pendingLocationId, setPendingLocationId] = useState<string | null>(null)

  const handleLocationChange = (nextLocationId: string) => {
    if (nextLocationId === (order.selectedLocationId ?? '')) return
    if (order.items.length === 0) {
      order.setSelectedLocationId(nextLocationId)
      return
    }
    setPendingLocationId(nextLocationId)
    setLocationConfirmOpen(true)
  }

  const handleConfirmLocationChange = () => {
    if (!pendingLocationId) return
    order.setSelectedLocationId(pendingLocationId)
    order.resetItems()
    setPendingLocationId(null)
    setLocationConfirmOpen(false)
  }

  const handleLocationDialogChange = (open: boolean) => {
    setLocationConfirmOpen(open)
    if (!open) {
      setPendingLocationId(null)
    }
  }

  const selectedBankAccount = useMemo(
    () => bankAccounts.find((a) => a.id === order.bankAccountId) ?? null,
    [bankAccounts, order.bankAccountId]
  )

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === order.selectedLocationId) ?? null,
    [locations, order.selectedLocationId]
  )

  const customerName = useMemo(() => {
    if (!order.customerId) return undefined
    return customers.find((c) => c.id === order.customerId)?.name ?? undefined
  }, [customers, order.customerId])

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
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='ml-auto shrink-0 gap-2'
            onClick={() => setPrintOpen(true)}
          >
            <Printer className='size-4' />
            In hoá đơn
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
              <SaleOrdersMeta
                locations={locations}
                locationId={order.selectedLocationId ?? ''}
                onLocationChange={handleLocationChange}
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
              cashReceived={order.cashReceived}
              onCashReceivedChange={order.setCashReceived}
              changeAmount={order.changeAmount}
              bankAccounts={bankAccounts}
              bankAccountId={order.bankAccountId}
              onBankAccountChange={order.setBankAccountId}
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

      <ConfirmDialog
        open={locationConfirmOpen}
        onOpenChange={handleLocationDialogChange}
        title='Đổi cửa hàng'
        desc='Đổi cửa hàng sẽ xóa toàn bộ sản phẩm đã thêm trong đơn. Bạn có chắc chắn muốn tiếp tục?'
        cancelBtnText='Hủy'
        confirmText='Xác nhận'
        handleConfirm={handleConfirmLocationChange}
      />

      <PrintPreviewDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        title='Xem trước hoá đơn'
        documentTitle={order.orderCode}
      >
        <SaleOrderInvoice
          orderCode={order.orderCode}
          storeName={selectedLocation?.name}
          storeAddress={selectedLocation?.address ?? undefined}
          storePhone={selectedLocation?.phone ?? undefined}
          items={order.items}
          totals={order.totals}
          orderDiscount={order.orderDiscount}
          customerName={customerName}
          paymentMethod={order.paymentMethod}
          cashReceived={order.cashReceived}
          changeAmount={order.changeAmount}
          bankAccount={selectedBankAccount}
          notes={order.notes}
        />
      </PrintPreviewDialog>
    </>
  )
}
