import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { saleOrdersRepo } from '@/client'
import { getRouteApi } from '@tanstack/react-router'
import { useUser } from '@/client/provider'
import {
  getBankAccountsQueryOptions,
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
import { SaleOrderInvoice } from './components/sale-order-invoice'
import { BankAccount } from '../bank-accounts/data/schema'


const route = getRouteApi('/_authenticated/sale-orders/detail')

export function SaleOrders() {
  const { orderId } = route.useSearch()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const [bankId, setBankId] = useState<string>('')

  const { data: orderDetail, isLoading, isError } = useQuery({
    ...getSaleOrderDetailWithRelationsQueryOptions(tenantId, orderId ?? ''),
    enabled: !!tenantId && !!orderId,
  })

  const { data: bankAccounts = [] } = useQuery({
    ...getBankAccountsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  useEffect(() => {
    if (bankAccounts.length === 0) return
    const defaultAccount = bankAccounts.find((account) => account.is_default) ?? bankAccounts[0]
    if (defaultAccount) {
      setBankId(defaultAccount.id)
    }
  }, [bankAccounts])

  // ── Print ──────────────────────────────────────────────────
  const [printOpen, setPrintOpen] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)

  const queryClient = useQueryClient()
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!orderDetail) throw new Error('Không tìm thấy đơn hàng.')
      return saleOrdersRepo.updateSaleOrder({
        orderId: orderDetail.id,
        order: {
          status: '9_CANCELLED',
        },
      })
    },
    onSuccess: () => {
      toast.success('Huỷ đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['sale-orders', tenantId, 'detail-with-relations', orderId] })
      setCancelConfirmOpen(false)
    },
    onError: (error) => {
      toast.error('Huỷ đơn hàng thất bại', {
        description: error.message,
      })
    },
  })

  if (isError) toast.error('Đã xảy ra lỗi khi tải thông tin đơn hàng.')

  const handleConfirmCancelOrder = () => {
    cancelMutation.mutate()
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-2'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Thông tin đơn hàng</h2>
            {orderDetail?.status === '2_COMPLETE' && (
              <p className='text-sm text-muted-foreground'>
                Bạn có thể sửa lại chiết khấu hoặc huỷ đơn hàng
              </p>
            )}
          </div>
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
        {(isLoading || !orderDetail) ? (
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
              bankId={bankId}
              setBankId={setBankId}
              bankAccounts={bankAccounts}
              order={orderDetail}
              onCancelOrder={() => setCancelConfirmOpen(true)}
              isSubmitting={cancelMutation.isPending}
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
        documentTitle={orderDetail?.sale_order_code}
      >
        {(isLoading || !orderDetail) ? (
          <div className='flex items-center justify-center py-10 text-muted-foreground'>Đang tải...</div>
        ) : (
          <SaleOrderInvoice
            orderCode={orderDetail.sale_order_code}
            storeName={orderDetail.location?.name ?? null}
            storeAddress={orderDetail.location?.address ?? null}
            storePhone={orderDetail.location?.phone ?? null}
            items={orderDetail.items}
            subtotal={orderDetail.total_amount + orderDetail.discount}
            total={orderDetail.total_amount}
            orderDiscount={orderDetail.discount}
            customerName={orderDetail.customer?.name ?? 'Khách lẻ'}
            paymentMethod={orderDetail.customer_paid_amount ? 'CASH' : 'TRANSFER'}
            cashReceived={orderDetail.customer_paid_amount}
            changeAmount={Math.max((orderDetail.customer_paid_amount ?? 0) - orderDetail.total_amount, 0)}
            bankAccount={bankAccounts.find((account) => account.id === bankId) as BankAccount}
            notes={orderDetail.notes}
          />)}
      </PrintPreviewDialog>
    </>
  )
}
