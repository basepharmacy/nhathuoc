import { useEffect, useMemo, useRef, useState } from 'react'
import { Printer } from 'lucide-react'
import { type Customer, BankAccount, Location, ProductWithUnits, InventoryBatch, SaleOrderWithItems } from '@/services/supabase/'
import { SaleOrderTabControls, type Tab } from './sale-order-tab-controls'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PrintPreviewDialog } from '@/components/print-preview-dialog'
import { OrderKeyboardFooter } from '@/components/order-keyboard-footer'
import { CustomersActionDialog } from '@/features/customers/components/customers-action-dialog'
import { type SaleOrderItem } from '../data/types'
import { SaleOrdersItems } from './sale-orders-items'
import { SaleOrdersMeta } from './sale-orders-meta'
import { SaleOrdersSearch } from './sale-orders-search'
import { SaleOrdersSummary } from './sale-orders-summary'
import { SaleOrderInvoice } from './sale-order-invoice'
import { useSaleOrder } from '../hooks/use-sale-order'
import { useSaleOrderKeyboardShortcuts } from '../hooks/use-sale-order-keyboard-shortcuts'


type SaleOrderTabContentProps = {
  orderId?: string
  tenantId: string
  userId: string
  userLocationId: string | null
  products: ProductWithUnits[]
  customers: Customer[]
  bankAccounts: BankAccount[]
  locations: Location[]
  inventoryBatches: InventoryBatch[]
  orderDetail?: SaleOrderWithItems | null
  onOrderCodeChange?: (code: string) => void
  onOrderCompleted?: () => void
  onAddTab?: () => void
  onCloseTab?: () => void
  onCloseTabById?: (tabId: string) => void
  tabCount?: number
  isActive?: boolean
  tabs?: Tab[]
}

export function SaleOrderTabContent({
  orderId,
  tenantId,
  userId,
  userLocationId,
  products,
  customers,
  bankAccounts,
  locations,
  inventoryBatches,
  onOrderCodeChange,
  onOrderCompleted,
  onAddTab,
  onCloseTab,
  onCloseTabById,
  tabCount = 1,
  isActive = true,
  tabs,
  orderDetail,
}: SaleOrderTabContentProps) {
  // ── Per-tab queries ─────────────────────────────────────────

  const order = useSaleOrder({
    tenantId,
    userId,
    orderId,
    userLocationId,
    orderDetail: orderDetail ?? undefined,
    onComplete: onOrderCompleted
      ? () => onOrderCompleted()
      : undefined,
  })

  const onOrderCodeChangeRef = useRef(onOrderCodeChange)
  onOrderCodeChangeRef.current = onOrderCodeChange

  useEffect(() => {
    if (order.orderCode) {
      onOrderCodeChangeRef.current?.(order.orderCode)
    }
  }, [order.orderCode])

  // Reset order when navigating back from edit mode (orderId removed)
  const prevOrderIdRef = useRef(orderId)
  useEffect(() => {
    if (prevOrderIdRef.current && !orderId) {
      order.resetOrder()
    }
    prevOrderIdRef.current = orderId
  }, [orderId, order.resetOrder])

  // ── Effects ─────────────────────────────────────────────────
  useEffect(() => {
    const inventoryBatchesByLocation = inventoryBatches.filter((batch) => {
      if (!order.selectedLocationId) return true
      return batch.location_id === order.selectedLocationId
    })
    order.setInventoryBatches(inventoryBatchesByLocation)
  }, [inventoryBatches, order.selectedLocationId])

  useEffect(() => {
    order.resetBatchCache()
  }, [order.selectedLocationId])

  useEffect(() => {
    if (order.selectedLocationId || locations.length === 0) return
    order.setSelectedLocationId(userLocationId ?? locations[0].id)
  }, [order.selectedLocationId, locations, userLocationId, order.setSelectedLocationId])

  useEffect(() => {
    if (order.bankAccountId || bankAccounts.length === 0) return
    const defaultAccount = bankAccounts.find((account) => account.is_default) ?? bankAccounts[0]
    if (defaultAccount) {
      order.setBankAccountId(defaultAccount.id)
    }
  }, [bankAccounts, order.bankAccountId, order.setBankAccountId])

  useEffect(() => {
    if (!orderDetail || order.hasInitialized || products.length === 0) return

    const productLookup = new Map(products.map((p) => [p.id, p]))
    const batchById = new Map(inventoryBatches.map((b) => [b.id, b]))

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
    })
  }, [orderDetail, order.hasInitialized, products, inventoryBatches, tenantId, userLocationId, orderId])

  // ── Dialogs ───────────────────────────────────────────────
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
  } = useSaleOrderKeyboardShortcuts({
    isActive,
    items: order.items,
    onSaveDraft: order.saveDraft,
    onSubmit: order.submit,
    onAddTab,
    onSetResetConfirmOpen: setResetConfirmOpen,
    onSetPrintOpen: setPrintOpen,
    onQuantityChange: order.handleQuantityChange,
    onRemoveItem: order.removeItem,
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
    if (tabCount > 1 && onCloseTab) {
      onCloseTab()
    } else {
      order.resetOrder()
      setSelectedItemIndex(-1)
    }
    setResetConfirmOpen(false)
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
  const isLoadingEditData = Boolean(orderId) && (!orderDetail || !order.hasInitialized)

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-2'>
          <SaleOrdersSearch
            ref={searchRef}
            products={products}
            onAddProduct={order.addProduct}
            autoFocus
          />
          {tabs && onCloseTabById && onAddTab && (
            <SaleOrderTabControls
              tabs={tabs}
              orderId={orderId}
              onCloseTab={onCloseTabById}
              onAddTab={onAddTab}
            />
          )}
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
                orderCode={order.orderCode}
                status='1_DRAFT'
              />

              <SaleOrdersItems
                items={order.items}
                onUpdateItem={order.updateItem}
                onQuantityChange={order.handleQuantityChange}
                onUnitChange={order.handleUnitChange}
                onRemoveItem={order.removeItem}
                selectedItemIndex={selectedItemIndex}
                onSelectedItemIndexChange={setSelectedItemIndex}
                editingPriceItemId={editingPriceItemId}
                onEditingPriceItemIdChange={setEditingPriceItemId}
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
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title='Huỷ đơn hiện tại'
        desc='Bạn có muốn huỷ đơn hiện tại và tạo đơn mới không? Toàn bộ thông tin đơn sẽ bị xóa.'
        cancelBtnText='Không'
        confirmText='Xác nhận'
        destructive
        handleConfirm={handleConfirmResetOrder}
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

      <OrderKeyboardFooter
        shortcuts={[
          { key: 'F1', label: 'Tạo đơn mới' },
          { key: 'F3', label: 'Lưu nháp' },
          { key: 'ESC', label: 'Huỷ đơn' },
          { key: 'F6', label: 'In hoá đơn' },
          { key: 'F9', label: 'Thanh toán' },
          { key: '↑↓', label: 'Chọn sản phẩm' },
          { key: '←→', label: 'Tăng giảm số lượng' },
          { key: 'Del', label: 'Xoá sản phẩm' },
        ]}
      />
    </>
  )
}
