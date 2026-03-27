import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Printer } from 'lucide-react'
import { purchaseOrdersRepo } from '@/client'
import { useUser } from '@/client/provider'
import { getPurchaseOrderDetailWithRelationsQueryOptions } from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { PrintPreviewDialog } from '@/components/print-preview-dialog'
import { OrderKeyboardFooter } from '@/components/order-keyboard-footer'
import { mapSupabaseError } from '@/lib/error-mapper'
import { PurchaseOrderInvoice } from '@/features/purchase-orders/components/purchase-order-invoice'
import { type PaymentStatus } from '@/features/purchase-orders/data/types'
import { PurchaseOrderDetailMeta } from './components/purchase-order-detail-meta'
import { PurchaseOrderDetailItems } from './components/purchase-order-detail-items'
import { PurchaseOrderDetailSummary } from './components/purchase-order-detail-summary'

const route = getRouteApi('/_authenticated/purchase-orders/detail')

export function PurchaseOrderDetail() {
  const { orderCode } = route.useSearch()
  const navigate = useNavigate()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  // ── Query ─────────────────────────────────────────────────
  const { data: orderDetail, isLoading: isOrderLoading } = useQuery({
    ...getPurchaseOrderDetailWithRelationsQueryOptions(tenantId, orderCode ?? ''),
    enabled: !!tenantId && !!orderCode,
  })

  const queryClient = useQueryClient()

  // ── Form state ──────────────────────────────────────────────
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('1_UNPAID')
  const [notes, setNotes] = useState('')
  const [hasInitialized, setHasInitialized] = useState(false)

  // ── Derived ──────────────────────────────────────────────────
  const orderStatus = orderDetail?.status ?? '2_ORDERED'
  const isOrdered = orderStatus === '2_ORDERED'
  const isReadOnly = !isOrdered

  // Initialize from order detail
  useEffect(() => {
    if (!orderDetail || hasInitialized) return
    setOrderDiscount(orderDetail.discount ?? 0)
    setPaidAmount(orderDetail.paid_amount ?? 0)
    setPaymentStatus(orderDetail.payment_status)
    setNotes(orderDetail.notes ?? '')
    setHasInitialized(true)
  }, [orderDetail, hasInitialized])

  const subtotal = useMemo(
    () =>
      (orderDetail?.items ?? []).reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      ),
    [orderDetail?.items]
  )

  const prevTotalRef = useRef<number | null>(null)
  useEffect(() => {
    const total = Math.max(0, subtotal - orderDiscount)
    if (prevTotalRef.current !== null && prevTotalRef.current !== total) {
      if (total <= paidAmount) {
        setPaidAmount(total)
        setPaymentStatus('3_PAID')
      }
    }
    prevTotalRef.current = total
  }, [subtotal, orderDiscount, paidAmount])

  const totals = useMemo(() => {
    const total = Math.max(0, subtotal - orderDiscount)
    const debt = Math.max(0, total - paidAmount)
    return { subtotal, total, debt }
  }, [subtotal, orderDiscount, paidAmount])

  // ── Mutations ───────────────────────────────────────────────
  const normalizePaymentStatus = (paid: number): PaymentStatus =>
    paid <= 0 ? '1_UNPAID' : paid >= totals.total ? '3_PAID' : '2_PARTIALLY_PAID'

  const batchUpdateMutation = useMutation({
    mutationFn: async (params: { itemId: number; batchCode: string; expiryDate: string }) => {
      await purchaseOrdersRepo.updatePurchaseOrderItem({
        itemId: params.itemId,
        tenantId,
        updates: {
          batch_code: params.batchCode || null,
          expiry_date: params.expiryDate || null,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', tenantId] })
    },
    onError: (error: unknown) => {
      toast.error(mapSupabaseError(error))
    },
  })

  const handleBatchSave = (itemId: number, _productId: string, batchCode: string, expiryDate: string) => {
    batchUpdateMutation.mutate({ itemId, batchCode, expiryDate })
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!orderCode || !orderDetail) throw new Error('Không tìm thấy đơn nhập hàng.')
      const normalizedPaid = Math.min(paidAmount, totals.total)

      await purchaseOrdersRepo.updatePurchaseOrder({
        orderId: orderDetail.id,
        order: {
          status: '4_STORED' as const,
          payment_status: normalizePaymentStatus(normalizedPaid),
          paid_amount: normalizedPaid,
          discount: orderDiscount,
          total_amount: totals.total,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', tenantId] })
      queryClient.invalidateQueries({
        queryKey: ['inventory-batches', tenantId, 'all', 'all-available'],
      })
      toast.success('Đã nhập kho thành công.')
      navigate({ to: '/purchase-orders/history' })
    },
    onError: (error: unknown) => {
      toast.error(mapSupabaseError(error))
    },
  })

  const submit = () => {
    const items = orderDetail?.items ?? []
    const missingBatch = items.filter((item) => !item.batch_code)
    if (missingBatch.length > 0) {
      toast.error(`Vui lòng chọn lô cho tất cả sản phẩm trước khi nhập kho. Còn ${missingBatch.length} sản phẩm chưa chọn lô.`)
      return
    }
    updateMutation.mutate()
  }
  const isSubmitting = updateMutation.isPending

  // ── Effects ─────────────────────────────────────────────────
  useEffect(() => {
    if (!orderCode || isOrderLoading) return
    if (!orderDetail) {
      toast.error('Không tìm thấy đơn nhập hàng.')
      navigate({ to: '/purchase-orders/history' })
    }
  }, [orderDetail, orderCode, isOrderLoading, navigate])

  // Redirect draft orders to edit page
  useEffect(() => {
    if (!orderDetail || isOrderLoading) return
    if (orderDetail.status === '1_DRAFT') {
      navigate({ to: '/purchase-orders', search: { orderCode: orderCode ?? '' } })
    }
  }, [orderDetail, isOrderLoading, orderCode, navigate])

  // ── Print ──────────────────────────────────────────────────
  const [printOpen, setPrintOpen] = useState(false)

  // ── Keyboard shortcuts ─────────────────────────────────────
  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
      const isFunctionKey = event.key.startsWith('F') && event.key.length <= 3

      if (isInput && !isFunctionKey) return

      switch (event.key) {
        case 'F6': {
          event.preventDefault()
          setPrintOpen(true)
          break
        }
        case 'F9': {
          event.preventDefault()
          if (!isReadOnly) submit()
          break
        }
      }
    },
    [isReadOnly, submit]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcuts)
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [handleKeyboardShortcuts])

  // ── Render ──────────────────────────────────────────────────
  const isLoading =
    Boolean(orderCode) && (!orderDetail || !hasInitialized || isOrderLoading)

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-4'>
          <h1 className='text-lg font-semibold'>Chi tiết đơn nhập hàng</h1>
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
        {isLoading ? (
          <div className='flex items-center justify-center py-10 text-muted-foreground'>
            Đang tải...
          </div>
        ) : orderDetail ? (
          <div className='grid min-h-[calc(100svh-200px)] gap-4 lg:grid-cols-[minmax(0,1fr)_320px]'>
            <div className='flex flex-col gap-4'>
              <PurchaseOrderDetailMeta
                locationName={orderDetail.location?.name}
                orderCode={orderDetail.purchase_order_code ?? ''}
                status={orderDetail.status}
                issuedAt={orderDetail.issued_at ?? ''}
              />

              <PurchaseOrderDetailItems
                items={orderDetail.items}
                tenantId={tenantId}
                locationId={orderDetail.location_id}
                isOrdered={isOrdered}
                onBatchSave={handleBatchSave}
              />
            </div>

            <PurchaseOrderDetailSummary
              orderCode={orderDetail.purchase_order_code ?? ''}
              supplierName={orderDetail.supplier?.name}
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
              onSubmit={submit}
              isSubmitting={isSubmitting}
              supplierId={orderDetail.supplier_id ?? ''}
            />
          </div>
        ) : null}
      </Main>

      <PrintPreviewDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        title='Xem trước phiếu nhập'
        documentTitle={orderDetail?.purchase_order_code ?? ''}
      >
        {orderDetail && (
          <PurchaseOrderInvoice
            orderCode={orderDetail.purchase_order_code ?? ''}
            storeName={orderDetail.location?.name}
            storeAddress={orderDetail.location?.address ?? undefined}
            storePhone={orderDetail.location?.phone ?? undefined}
            supplierName={orderDetail.supplier?.name}
            items={orderDetail.items}
            totals={totals}
            orderDiscount={orderDiscount}
            paidAmount={paidAmount}
            notes={notes}
          />
        )}
      </PrintPreviewDialog>

      {!isReadOnly && (
        <OrderKeyboardFooter
          shortcuts={[
            { key: 'F6', label: 'In hoá đơn' },
            { key: 'F9', label: 'Nhập kho' },
          ]}
        />
      )}
    </>
  )
}
