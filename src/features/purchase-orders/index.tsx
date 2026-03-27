import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PrintPreviewDialog } from '@/components/print-preview-dialog'
import { OrderKeyboardFooter } from '@/components/order-keyboard-footer'
import type { OrderItem } from './data/types'
import { PurchaseOrdersItems } from './components/purchase-orders-items'
import { PurchaseOrdersMeta } from './components/purchase-orders-meta'
import { PurchaseOrdersSearch } from './components/purchase-orders-search'
import { PurchaseOrdersSummary } from './components/purchase-orders-summary'
import { PurchaseOrderInvoice } from './components/purchase-order-invoice'
import { SuppliersActionDialog } from '@/features/suppliers/components/suppliers-action-dialog'
import { usePurchaseOrder } from './hooks/use-purchase-order'
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts'

const route = getRouteApi('/_authenticated/purchase-orders/')

export function PurchaseOrders() {
  const { orderCode } = route.useSearch()
  const navigate = useNavigate()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const userId = user?.profile?.id ?? ''
  const { selectedLocationId: sidebarLocationId } = useLocationContext()
  const userLocationId = sidebarLocationId ?? null

  // ── Queries ─────────────────────────────────────────────────
  const { data: orderDetail, isLoading: isOrderLoading } = useQuery({
    ...getPurchaseOrderDetailQueryOptions(tenantId, orderCode ?? ''),
    enabled: !!tenantId && !!orderCode,
  })

  const { data: products = [] } = useQuery({
    ...getProductsQueryOptions(tenantId),
    enabled: !!tenantId,
  })
  const activeProducts = useMemo(() => products.filter((p) => p.status === '2_ACTIVE'), [products])

  const { data: suppliers = [] } = useQuery({
    ...getSuppliersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.is_active),
    [suppliers]
  )

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const order = usePurchaseOrder({
    tenantId,
    userId,
    orderCode,
    userLocationId,
    orderDetail: orderDetail ?? undefined,
    onOrderSuccess: (code, status) => {
      if (status === '2_ORDERED') {
        navigate({ to: '/purchase-orders/detail', search: { orderCode: code } })
      } else {
        navigate({ to: '/purchase-orders', search: { orderCode: code } })
      }
    },
  })

  // ── Effects ─────────────────────────────────────────────────
  useEffect(() => {
    if (!orderCode || isOrderLoading) return
    if (!orderDetail) {
      toast.error('Không tìm thấy đơn nhập hàng.')
      navigate({ to: '/purchase-orders/history' })
    }
  }, [orderDetail, orderCode, isOrderLoading, navigate])

  // Redirect non-draft orders to detail page
  useEffect(() => {
    if (!orderDetail || isOrderLoading) return
    if (orderDetail.status !== '1_DRAFT') {
      navigate({ to: '/purchase-orders/detail', search: { orderCode: orderCode ?? '' } })
    }
  }, [orderDetail, isOrderLoading, orderCode, navigate])

  useEffect(() => {
    if (order.selectedLocationId || locations.length === 0) return
    order.setSelectedLocationId(sidebarLocationId ?? locations[0].id)
  }, [order.selectedLocationId, locations, sidebarLocationId, order.setSelectedLocationId])

  useEffect(() => {
    if (!orderDetail || order.hasInitialized || products.length === 0) return
    if (orderDetail.status !== '1_DRAFT') return

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
      supplierId: orderDetail.supplier_id ?? '',
      discount: orderDetail.discount ?? 0,
      notes: orderDetail.notes ?? '',
      locationId: orderDetail.location_id ?? userLocationId,
    })
  }, [orderDetail, order.hasInitialized, products, userLocationId, orderCode])

  const [pendingBatchItemId, setPendingBatchItemId] = useState<string | null>(null)

  const handleAddProduct = (product: Parameters<typeof order.addProduct>[0]) => {
    order.addProduct(product)
    //if (newItemId) setPendingBatchItemId(newItemId)
  }

  // ── Print ──────────────────────────────────────────────────
  const [printOpen, setPrintOpen] = useState(false)
  const [locationConfirmOpen, setLocationConfirmOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [pendingLocationId, setPendingLocationId] = useState<string | null>(null)

  // ── Keyboard shortcuts ─────────────────────────────────────
  const {
    searchRef,
    selectedItemIndex,
    setSelectedItemIndex,
    editingPriceItemId,
    setEditingPriceItemId,
  } = useKeyboardShortcuts({
    order,
    setPrintOpen,
    setResetConfirmOpen,
  })

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
    setPendingBatchItemId(null)
    setPendingLocationId(null)
    setLocationConfirmOpen(false)
  }

  const handleLocationDialogChange = (open: boolean) => {
    setLocationConfirmOpen(open)
    if (!open) {
      setPendingLocationId(null)
    }
  }

  const handleConfirmResetOrder = () => {
    order.resetOrder()
    setSelectedItemIndex(-1)
    setPendingBatchItemId(null)
    setResetConfirmOpen(false)
  }

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
    Boolean(orderCode) && (!orderDetail || !order.hasInitialized || isOrderLoading)

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-4'>
          <PurchaseOrdersSearch
            ref={searchRef}
            products={activeProducts}
            onAddProduct={handleAddProduct}
            autoFocus={!order.isEdit}
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
                onLocationChange={handleLocationChange}
                orderCode={order.orderCode}
                onOrderCodeChange={order.setOrderCode}
                issuedAt={order.issuedAt}
                onIssuedAtChange={order.setIssuedAt}
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
                selectedItemIndex={selectedItemIndex}
                onSelectedItemIndexChange={setSelectedItemIndex}
                editingPriceItemId={editingPriceItemId}
                onEditingPriceItemIdChange={setEditingPriceItemId}
              />
            </div>

            <PurchaseOrdersSummary
              suppliers={activeSuppliers}
              supplierId={order.supplierId}
              onSupplierChange={order.setSupplierId}
              totals={order.totals}
              orderDiscount={order.orderDiscount}
              onOrderDiscountChange={order.setOrderDiscount}
              notes={order.notes}
              onNotesChange={order.setNotes}
              onSaveDraft={order.saveDraft}
              onSubmit={order.submit}
              isSubmitting={order.isSubmitting}
              onAddSupplier={() => order.setIsAddSupplierOpen(true)}
            />
            <SuppliersActionDialog
              open={order.isAddSupplierOpen}
              onOpenChange={order.setIsAddSupplierOpen}
              onCreated={(supplier) => order.setSupplierId(supplier.id)}
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
          items={order.items.map((item) => ({
            id: item.id,
            product: item.product,
            product_unit: item.product.product_units?.find((u) => u.id === item.productUnitId) ?? null,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount: item.discount,
          }))}
          totals={order.totals}
          orderDiscount={order.orderDiscount}
          paidAmount={0}
          notes={order.notes}
        />
      </PrintPreviewDialog>

      <ConfirmDialog
        open={locationConfirmOpen}
        onOpenChange={handleLocationDialogChange}
        title='Đổi cửa hàng'
        desc='Đổi cửa hàng sẽ xóa toàn bộ sản phẩm đã thêm trong đơn. Bạn có chắc chắn muốn tiếp tục?'
        cancelBtnText='Hủy'
        confirmText='Xác nhận'
        handleConfirm={handleConfirmLocationChange}
      />

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title='Huỷ đơn hiện tại'
        desc='Bạn có muốn huỷ đơn hiện tại và tạo đơn mới không? Toàn bộ thông tin đơn sẽ bị xóa.'
        cancelBtnText='Không'
        confirmText='Xác nhận'
        destructive
        handleConfirm={handleConfirmResetOrder}
      />

      <OrderKeyboardFooter
        shortcuts={[
          { key: 'F1', label: 'Lưu nháp' },
          { key: 'ESC', label: 'Huỷ đơn' },
          { key: 'F6', label: 'In hoá đơn' },
          { key: 'F9', label: 'Đặt hàng' },
          { key: '↑/↓', label: 'Chọn sản phẩm' },
          { key: 'F8', label: 'Sửa đơn giá' },
          { key: '←/→', label: 'Tăng giảm số lượng' },
          { key: 'Del', label: 'Xoá sản phẩm' },
        ]}
      />
    </>
  )
}
