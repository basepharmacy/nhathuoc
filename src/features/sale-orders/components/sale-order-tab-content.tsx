import { useEffect, useMemo, useState, useRef } from 'react'
import { Printer } from 'lucide-react'
import { type Customer, BankAccount, Location, ProductWithUnits, InventoryBatch } from '@/services/supabase/'
import { SaleOrderTabControls, type Tab } from './sale-order-tab-controls'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PrintPreviewDialog } from '@/components/print-preview-dialog'
import { OrderKeyboardFooter } from '@/components/order-keyboard-footer'
import { CustomersActionDialog } from '@/features/customers/components/customers-action-dialog'
import { type SaleOrderInCreate } from '../data/types'
import { SaleOrdersItems } from './sale-orders-items'
import { SaleOrdersMeta } from './sale-orders-meta'
import { SaleOrdersSearch } from './sale-orders-search'
import { SaleOrdersSummary } from './sale-orders-summary'
import { SaleOrderInvoice } from './sale-order-invoice'
import { useSaleOrder } from '../hooks/use-sale-order'
import { useSaleOrderKeyboardShortcuts } from '../hooks/use-sale-order-keyboard-shortcuts'


type SaleOrderTabContentProps = {
  initialData: SaleOrderInCreate
  tenantId: string
  userId: string
  products: ProductWithUnits[]
  customers: Customer[]
  bankAccounts: BankAccount[]
  locations: Location[]
  inventoryBatches: InventoryBatch[]
  onOrderCompleted?: (orderId: string, status: string) => void
  onAddTab?: () => void
  onCloseTab?: () => void
  onCloseTabById?: (tabId: string) => void
  onOrderCodeChange: (code: string) => void
  tabCount?: number
  isActive?: boolean
  tabs?: Tab[]
}

export function SaleOrderTabContent({
  initialData,
  tenantId,
  userId,
  products,
  customers,
  bankAccounts,
  locations,
  inventoryBatches,
  onOrderCompleted,
  onAddTab,
  onCloseTab,
  onCloseTabById,
  onOrderCodeChange,
  tabCount = 1,
  isActive = true,
  tabs,
}: SaleOrderTabContentProps) {
  const order = useSaleOrder({
    tenantId,
    userId,
    initialData,
    inventoryBatches,
    onComplete: onOrderCompleted
      ? (orderId, status) => onOrderCompleted(orderId, status)
      : undefined,
  })

  // ── Effects ─────────────────────────────────────────────────
  const onOrderCodeChangeRef = useRef(onOrderCodeChange)
  onOrderCodeChangeRef.current = onOrderCodeChange
  useEffect(() => {
    if (order.orderCode) {
      onOrderCodeChangeRef.current?.(order.orderCode)
    }
  }, [order.orderCode])

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
              orderId={initialData.id}
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
            subtotal={order.subtotal}
            orderDiscount={order.orderDiscount}
            onOrderDiscountChange={order.setOrderDiscount}
            paymentMethod={order.paymentMethod}
            onPaymentMethodChange={order.setPaymentMethod}
            cashReceived={order.cashReceived}
            onCashReceivedChange={order.setCashReceived}
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
          location={selectedLocation}
          items={order.items}
          subtotal={order.subtotal}
          orderDiscount={order.orderDiscount}
          customerName={customerName}
          paymentMethod={order.paymentMethod}
          cashReceived={order.cashReceived}
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
