import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Printer } from 'lucide-react'
import { type Customer, type BankAccount, type Location, type ProductWithUnits, type InventoryBatch } from '@/services/supabase/'
import { SaleOrderTabControls, type Tab } from './sale-order-tab-controls'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PrintPreviewDialog } from '@/components/print-preview-dialog'
import { CustomersActionDialog } from '@/features/customers/components/customers-action-dialog'
import { type SaleOrderInCreate } from '../data/types'
import { SaleOrdersItems } from './sale-orders-items'
import { SaleOrdersMeta } from './sale-orders-meta'
import { SaleOrdersSearch } from './sale-orders-search'
import { SaleOrdersSummary } from './sale-orders-summary'
import { SaleOrderInvoice } from './sale-order-invoice'
import { SaleOrderStoreProvider, useSaleOrderStore } from '../store/sale-order-context'
import { useSaleOrderMutations } from '../hooks/use-sale-order-mutations'
import { useSaleOrderKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts'
import { selectSubtotal } from '../store/sale-order-selectors'


type SaleOrderTabContentProps = {
  initialData: SaleOrderInCreate
  tenantId: string
  userId: string
  products: ProductWithUnits[]
  customers: Customer[]
  bankAccounts: BankAccount[]
  locations: Location[]
  inventoryBatches: InventoryBatch[]
  onOrderCompleted?: (orderCode: string, status: string) => void
  onAddTab?: () => void
  onCloseTab?: () => void
  onCloseTabById?: (tabId: string) => void
  onOrderCodeChange: (code: string) => void
  tabCount?: number
  isActive?: boolean
  tabs?: Tab[]
}

export function SaleOrderTabContent(props: SaleOrderTabContentProps) {
  return (
    <SaleOrderStoreProvider
      initialData={props.initialData}
      inventoryBatches={props.inventoryBatches}
    >
      <SaleOrderTabContentInner {...props} />
    </SaleOrderStoreProvider>
  )
}

// ── Invoice wrapper: reads from store so parent doesn't need to ──
function ConnectedSaleOrderInvoice({
  locations,
  customers,
  bankAccounts,
}: {
  locations: Location[]
  customers: Customer[]
  bankAccounts: BankAccount[]
}) {
  const orderCode = useSaleOrderStore((s) => s.orderCode)
  const items = useSaleOrderStore((s) => s.items)
  const orderDiscount = useSaleOrderStore((s) => s.orderDiscount)
  const paymentMethod = useSaleOrderStore((s) => s.paymentMethod)
  const cashReceived = useSaleOrderStore((s) => s.cashReceived)
  const bankAccountId = useSaleOrderStore((s) => s.bankAccountId)
  const customerId = useSaleOrderStore((s) => s.customerId)
  const selectedLocationId = useSaleOrderStore((s) => s.selectedLocationId)
  const notes = useSaleOrderStore((s) => s.notes)
  const subtotal = useSaleOrderStore(selectSubtotal)

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId) ?? null,
    [locations, selectedLocationId]
  )
  const selectedBankAccount = useMemo(
    () => bankAccounts.find((a) => a.id === bankAccountId) ?? null,
    [bankAccounts, bankAccountId]
  )
  const customerName = useMemo(() => {
    if (!customerId) return undefined
    return customers.find((c) => c.id === customerId)?.name ?? undefined
  }, [customers, customerId])

  return (
    <SaleOrderInvoice
      orderCode={orderCode}
      location={selectedLocation}
      items={items}
      subtotal={subtotal}
      orderDiscount={orderDiscount}
      customerName={customerName}
      paymentMethod={paymentMethod}
      cashReceived={cashReceived}
      bankAccount={selectedBankAccount}
      notes={notes}
    />
  )
}

function SaleOrderTabContentInner({
  initialData,
  tenantId,
  userId,
  products,
  customers,
  bankAccounts,
  locations,
  onOrderCompleted,
  onAddTab,
  onCloseTab,
  onCloseTabById,
  onOrderCodeChange,
  tabCount = 1,
  isActive = true,
  tabs,
}: SaleOrderTabContentProps) {
  const handleComplete = useCallback(
    (orderCode: string, status: string) => onOrderCompleted?.(orderCode, status),
    [onOrderCompleted]
  )

  // ── Store: only subscribe to what this component actually needs ──
  const orderCode = useSaleOrderStore((s) => s.orderCode)
  const items = useSaleOrderStore((s) => s.items)
  const selectedLocationId = useSaleOrderStore((s) => s.selectedLocationId)
  const customerId = useSaleOrderStore((s) => s.customerId)
  const isAddCustomerOpen = useSaleOrderStore((s) => s.isAddCustomerOpen)

  const currentCustomerName = useMemo(
    () => customers.find((c) => c.id === customerId)?.name ?? '',
    [customers, customerId]
  )
  const currentLocationName = useMemo(
    () => locations.find((l) => l.id === selectedLocationId)?.name ?? '',
    [locations, selectedLocationId]
  )

  const { saveDraft, submit, isSubmitting } = useSaleOrderMutations({
    tenantId,
    userId,
    customerName: currentCustomerName,
    locationName: currentLocationName,
    onComplete: onOrderCompleted ? handleComplete : undefined,
  })

  const addProduct = useSaleOrderStore((s) => s.addProduct)
  const setSelectedLocationId = useSaleOrderStore((s) => s.setSelectedLocationId)
  const setCustomerId = useSaleOrderStore((s) => s.setCustomerId)
  const setIsAddCustomerOpen = useSaleOrderStore((s) => s.setIsAddCustomerOpen)
  const resetItems = useSaleOrderStore((s) => s.resetItems)
  const resetOrder = useSaleOrderStore((s) => s.resetOrder)
  const handleQuantityChange = useSaleOrderStore((s) => s.handleQuantityChange)
  const removeItem = useSaleOrderStore((s) => s.removeItem)

  // ── Effects ─────────────────────────────────────────────────
  const onOrderCodeChangeRef = useRef(onOrderCodeChange)
  onOrderCodeChangeRef.current = onOrderCodeChange
  useEffect(() => {
    if (orderCode) {
      onOrderCodeChangeRef.current?.(orderCode)
    }
  }, [orderCode])

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
    items,
    onSaveDraft: saveDraft,
    onSubmit: submit,
    onAddTab,
    onSetResetConfirmOpen: setResetConfirmOpen,
    onSetPrintOpen: setPrintOpen,
    onQuantityChange: handleQuantityChange,
    onRemoveItem: removeItem,
  })

  const handleLocationChange = (nextLocationId: string) => {
    if (nextLocationId === (selectedLocationId ?? '')) return
    if (items.length === 0) {
      setSelectedLocationId(nextLocationId)
      return
    }
    setPendingLocationId(nextLocationId)
    setLocationConfirmOpen(true)
  }

  const handleConfirmLocationChange = () => {
    if (!pendingLocationId) return
    setSelectedLocationId(pendingLocationId)
    resetItems()
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
      resetOrder()
      setSelectedItemIndex(-1)
    }
    setResetConfirmOpen(false)
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-2'>
          <SaleOrdersSearch
            ref={searchRef}
            products={products}
            onAddProduct={addProduct}
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
              locationId={selectedLocationId ?? ''}
              onLocationChange={handleLocationChange}
              orderCode={orderCode}
              status='1_DRAFT'
            />

            <SaleOrdersItems
              selectedItemIndex={selectedItemIndex}
              onSelectedItemIndexChange={setSelectedItemIndex}
              editingPriceItemId={editingPriceItemId}
              onEditingPriceItemIdChange={setEditingPriceItemId}
            />
          </div>

          <SaleOrdersSummary
            customers={customers}
            bankAccounts={bankAccounts}
            onSaveDraft={saveDraft}
            onSubmit={submit}
            isSubmitting={isSubmitting}
          />
        </div>
      </Main>

      <CustomersActionDialog
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
        onCreated={(customer) => setCustomerId(customer.id)}
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
        documentTitle={orderCode}
      >
        <ConnectedSaleOrderInvoice
          locations={locations}
          customers={customers}
          bankAccounts={bankAccounts}
        />
      </PrintPreviewDialog>
    </>
  )
}
