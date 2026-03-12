import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useUser } from '@/client/provider'
import {
  getSaleOrderDetailWithRelationsQueryOptions,
} from '@/client/queries'
import { Printer } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PrintPreviewDialog } from '@/components/print-preview-dialog'
import { SaleOrdersItems } from './components/sale-orders-items'
import { SaleOrdersMeta } from './components/sale-orders-meta'
import { SaleOrdersSummary } from './components//sale-orders-summary'
import { SaleOrderInvoice } from './components//sale-order-invoice'


const route = getRouteApi('/_authenticated/sale-orders/detail')

export function SaleOrders() {
  const { orderId } = route.useSearch()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const { data: orderDetail, isLoading, isError } = useQuery({
    ...getSaleOrderDetailWithRelationsQueryOptions(tenantId, orderId ?? ''),
    enabled: !!tenantId && !!orderId,
  })
  // TODO xử lý trường hợp bị lỗi hoặc không tìm thấy đơn hàng
  if (isError || !orderDetail) {
    return (
      <div className='flex items-center justify-center py-10 text-muted-foreground'>
        Không tìm thấy đơn hàng.
      </div>
    )
  }

  const paymentMethod = orderDetail.customer_paid_amount ? 'CASH' : 'TRANSFER'
  const changeAmount = orderDetail.customer_paid_amount ? orderDetail.customer_paid_amount - orderDetail.total_amount : undefined
  const subTotalAmount = orderDetail.total_amount + orderDetail.discount
  const isCompleted = orderDetail.status === '2_COMPLETE'
  // ── Print ──────────────────────────────────────────────────
  const [printOpen, setPrintOpen] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)

  const handleConfirmCancelOrder = () => {
    //TODO: Implement cancel order logic
    setCancelConfirmOpen(false)
  }


  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-2'>
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
        {isLoading ? (
          <div className='flex items-center justify-center py-10 text-muted-foreground'>
            Đang tải...
          </div>
        ) : (
          <div className='grid min-h-[calc(100svh-200px)] gap-4 lg:grid-cols-[minmax(0,1fr)_320px]'>
            <div className='flex flex-col gap-4'>
              <SaleOrdersMeta
                locationName={orderDetail.location?.name ?? '—'}
                orderCode={orderDetail.sale_order_code}
                status={orderDetail.status}
              />

              <SaleOrdersItems
                items={orderDetail.items}
              />
            </div>

            <SaleOrdersSummary
              subTotalAmmount={subTotalAmount}
              totalAmmount={orderDetail.total_amount}
              orderDiscount={orderDetail.discount}
              paymentMethod={paymentMethod}
              customerPaidAmmount={orderDetail.customer_paid_amount}
              changeAmount={changeAmount}
              customerName={orderDetail.customer?.name ?? 'Khách lẻ'}
              isCompleted={isCompleted}
              onCancelOrder={() => setCancelConfirmOpen(true)}
              notes={orderDetail.notes ?? ''}
              isSubmitting={false} //TODO: handle submitting state when cancel order
            />
          </div>
        )}
      </Main>

      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title='Huỷ đơn hàng'
        desc='Bạn có chắc chắn muốn huỷ đơn hàng này không? Tồn kho của các sản phẩm sẽ được hoàn trả.'
        cancelBtnText='Không'
        confirmText='Huỷ đơn hàng'
        destructive
        handleConfirm={handleConfirmCancelOrder}
      />

      <PrintPreviewDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        title='Xem trước hoá đơn'
        documentTitle={orderDetail.sale_order_code}
      >
        <SaleOrderInvoice
          orderCode={orderDetail.sale_order_code}
          storeName={orderDetail.location?.name ?? null}
          storeAddress={orderDetail.location?.address ?? null}
          storePhone={orderDetail.location?.phone ?? null}
          items={orderDetail.items}
          subtotal={subTotalAmount}
          total={orderDetail.total_amount}
          orderDiscount={orderDetail.discount}
          customerName={orderDetail.customer?.name ?? 'Khách lẻ'}
          paymentMethod={paymentMethod}
          cashReceived={orderDetail.customer_paid_amount}
          changeAmount={changeAmount}
          bankAccount={null} // TODO get default bank account of the store for transfer payment method
          notes={orderDetail.notes}
        />
      </PrintPreviewDialog>
    </>
  )
}
