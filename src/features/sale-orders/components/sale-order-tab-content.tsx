import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Printer } from 'lucide-react'
import { inventoryBatchesRepo } from '@/client'
import {
  getInventoryBatchesQueryOptions,
  getSaleOrderDetailQueryOptions,
} from '@/client/queries'
import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'
import { type Customer } from '@/services/supabase/database/repo/customersRepo'
import { type BankAccount } from '@/services/supabase/database/repo/bankAccountsRepo'
import { type Location } from '@/services/supabase/database/repo/locationsRepo'
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
import { SaleOrdersSearch, type SaleOrdersSearchHandle } from './sale-orders-search'
import { SaleOrdersSummary } from './sale-orders-summary'
import { SaleOrderInvoice } from './sale-order-invoice'
import { useSaleOrder } from '../hooks/use-sale-order'

const EMPTY_BATCHES: InventoryBatch[] = []

type SaleOrderTabContentProps = {
  orderId?: string
  tenantId: string
  userId: string
  userLocationId: string | null
  products: ProductWithUnits[]
  customers: Customer[]
  bankAccounts: BankAccount[]
  locations: Location[]
  navigate: (opts: { search?: { orderId: string }; to?: string }) => void
  onOrderCodeChange?: (code: string) => void
  onOrderCompleted?: (createdOrderId: string) => void
  onAddTab?: () => void
  onCloseTab?: () => void
  tabCount?: number
  isActive?: boolean
  headerSlot?: React.ReactNode
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
  navigate,
  onOrderCodeChange,
  onOrderCompleted,
  onAddTab,
  onCloseTab,
  tabCount = 1,
  isActive = true,
  headerSlot,
}: SaleOrderTabContentProps) {
  // ── Per-tab queries ─────────────────────────────────────────
  const { data: orderDetail, isLoading: isOrderLoading } = useQuery({
    ...getSaleOrderDetailQueryOptions(tenantId, orderId ?? ''),
    enabled: !!tenantId && !!orderId,
  })

  const order = useSaleOrder({
    tenantId,
    userId,
    orderId,
    userLocationId,
    orderDetail: orderDetail ?? undefined,
    navigate,
    onComplete: onOrderCompleted
      ? (createdOrderId: string) => onOrderCompleted(createdOrderId)
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
    order.setSelectedLocationId(userLocationId ?? locations[0].id)
  }, [order.selectedLocationId, locations, userLocationId, order.setSelectedLocationId])

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
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [pendingLocationId, setPendingLocationId] = useState<string | null>(null)

  // ── Keyboard shortcuts ─────────────────────────────────────
  const searchRef = useRef<SaleOrdersSearchHandle>(null)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1)
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null)

  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in input/textarea (except function keys)
      const target = event.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
      const isFunctionKey = event.key.startsWith('F') && event.key.length <= 3

      if (isInput && !isFunctionKey && event.key !== 'Escape' && event.key !== 'Delete') return

      switch (event.key) {
        case 'F1': {
          event.preventDefault()
          if (onAddTab) onAddTab()
          break
        }
        case 'F3': {
          event.preventDefault()
          if (!order.isReadOnly) order.saveDraft()
          break
        }
        case 'Escape': {
          // Only show reset confirm when no other dialog/modal is open
          const hasOpenDialog = document.querySelector('[role="dialog"]')
          if (!order.isReadOnly && !hasOpenDialog) {
            event.preventDefault()
            // Blur the focused input first so user sees the dialog cleanly
            if (isInput) (target as HTMLElement).blur()
            setResetConfirmOpen(true)
          }
          break
        }
        case 'F6': {
          event.preventDefault()
          setPrintOpen(true)
          break
        }
        case 'F9': {
          event.preventDefault()
          if (!order.isReadOnly) order.submit()
          break
        }
        case 'ArrowDown': {
          if (isInput) break
          event.preventDefault()
          if (event.shiftKey && order.items.length > 0) {
            // Shift+ArrowDown → focus search
            searchRef.current?.focus()
          } else if (order.items.length > 0) {
            setSelectedItemIndex((prev) =>
              prev + 1 >= order.items.length ? 0 : prev + 1
            )
          }
          break
        }
        case 'ArrowUp': {
          if (isInput) break
          event.preventDefault()
          if (order.items.length > 0) {
            setSelectedItemIndex((prev) =>
              prev - 1 < 0 ? order.items.length - 1 : prev - 1
            )
          }
          break
        }
        case 'Delete': {
          if (isInput) break
          event.preventDefault()
          if (
            !order.isReadOnly &&
            selectedItemIndex >= 0 &&
            selectedItemIndex < order.items.length
          ) {
            const itemToRemove = order.items[selectedItemIndex]
            order.removeItem(itemToRemove.id)
            setSelectedItemIndex((prev) =>
              Math.min(prev, order.items.length - 2)
            )
          }
          break
        }
        case '+':
        case 'ArrowRight': {
          if (isInput) break
          event.preventDefault()
          if (
            !order.isReadOnly &&
            selectedItemIndex >= 0 &&
            selectedItemIndex < order.items.length
          ) {
            const item = order.items[selectedItemIndex]
            order.handleQuantityChange(item.id, item.quantity + 1)
          }
          break
        }
        case '-':
        case 'ArrowLeft': {
          if (isInput) break
          event.preventDefault()
          if (
            !order.isReadOnly &&
            selectedItemIndex >= 0 &&
            selectedItemIndex < order.items.length
          ) {
            const item = order.items[selectedItemIndex]
            if (item.quantity > 1) {
              order.handleQuantityChange(item.id, item.quantity - 1)
            }
          }
          break
        }
      }
    },
    [order, selectedItemIndex, onAddTab, onCloseTab, tabCount]
  )

  useEffect(() => {
    if (!isActive) return
    window.addEventListener('keydown', handleKeyboardShortcuts)
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [handleKeyboardShortcuts, isActive])

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

  const handleConfirmCancelOrder = () => {
    order.cancelOrder()
    setCancelConfirmOpen(false)
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
  const isLoadingEditData = Boolean(orderId) && (!orderDetail || !order.hasInitialized || isOrderLoading)

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-2'>
          <SaleOrdersSearch
            ref={searchRef}
            products={products}
            onAddProduct={order.addProduct}
            readOnly={order.isReadOnly}
          />
          {headerSlot}
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
                onUnitChange={order.handleUnitChange}
                onRemoveItem={order.removeItem}
                readOnly={order.isReadOnly}
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
              orderStatus={order.orderStatus}
              onSaveDraft={order.saveDraft}
              onSubmit={order.submit}
              onCancelOrder={() => setCancelConfirmOpen(true)}
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
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title='Huỷ đơn hàng'
        desc='Bạn có chắc chắn muốn huỷ đơn hàng này không? Tồn kho của các sản phẩm sẽ được hoàn trả.'
        cancelBtnText='Không'
        confirmText='Huỷ đơn hàng'
        destructive
        isLoading={order.isSubmitting}
        handleConfirm={handleConfirmCancelOrder}
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

      {!order.isReadOnly && (
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
      )}
    </>
  )
}
