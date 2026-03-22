import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DiscountInput } from '@/components/discount-input'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn, formatCurrency, normalizeNumber } from '@/lib/utils'
import { type PaymentStatus } from '@/features/purchase-orders/data/types'
import type { PurchaseOrder } from '@/services/supabase/'
import { PurchaseOrderQrDialog } from './purchase-order-qr-dialog'

type PurchaseOrderDetailSummaryProps = {
  supplierName?: string
  supplierId: string
  totals: {
    subtotal: number
    total: number
    debt: number
  }
  orderDiscount: number
  onOrderDiscountChange: (value: number) => void
  paymentStatus: PaymentStatus
  onPaymentStatusChange: (value: PaymentStatus) => void
  paidAmount: number
  onPaidAmountChange: (value: number) => void
  notes: string
  onNotesChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  orderStatus: PurchaseOrder['status']
  orderCode: string
}

const PAYMENT_OPTIONS: Array<{ label: string; value: PaymentStatus }> = [
  { label: 'Đã thanh toán', value: '3_PAID' },
  { label: 'Thanh toán 1 phần', value: '2_PARTIALLY_PAID' },
  { label: 'Ghi nợ', value: '1_UNPAID' },
]

export function PurchaseOrderDetailSummary({
  supplierName,
  supplierId,
  totals,
  orderDiscount,
  onOrderDiscountChange,
  paymentStatus,
  onPaymentStatusChange,
  paidAmount,
  onPaidAmountChange,
  notes,
  onNotesChange,
  onSubmit,
  isSubmitting,
  orderStatus,
  orderCode,
}: PurchaseOrderDetailSummaryProps) {
  const [qrOpen, setQrOpen] = useState(false)
  const isOrdered = orderStatus === '2_ORDERED'
  const isReadOnly = !isOrdered

  const handlePaymentStatusChange = (value: PaymentStatus) => {
    onPaymentStatusChange(value)
    if (value === '1_UNPAID') {
      onPaidAmountChange(0)
    }
    if (value === '3_PAID') {
      onPaidAmountChange(totals.total)
    }
  }

  return (
    <div className='space-y-4 rounded-xl border bg-card p-4 shadow-sm h-full'>
      {supplierName && (
        <>
          <div className='text-center'>
            <div className='text-sm text-muted-foreground'>Nhà cung cấp</div>
            <div className='text-lg font-semibold text-foreground'>{supplierName}</div>
          </div>
          <Separator />
        </>
      )}

      <div className='space-y-2 text-sm'>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Tổng tiền</span>
          <span className='font-semibold text-foreground'>
            {formatCurrency(totals.subtotal)}đ
          </span>
        </div>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Chiết khấu</span>
          <DiscountInput
            subtotal={totals.subtotal}
            value={orderDiscount}
            onChange={onOrderDiscountChange}
            disabled={isReadOnly}
          />
        </div>
      </div>

      <Separator />

      <div className='space-y-2 text-center'>
        <div className='text-sm text-muted-foreground'>Cần thanh toán</div>
        <div className='text-3xl font-bold text-foreground'>
          {formatCurrency(totals.total)}đ
        </div>
      </div>

      <Separator />

      <div className='space-y-2'>
        <div className='grid grid-cols-3 gap-2'>
          {PAYMENT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type='button'
              variant={paymentStatus === option.value ? 'default' : 'outline'}
              className={cn(
                'h-auto min-h-10 w-full rounded-full px-2 py-2 text-xs leading-4 whitespace-normal',
                paymentStatus !== option.value && 'text-muted-foreground'
              )}
              onClick={() => handlePaymentStatusChange(option.value)}
              disabled={isReadOnly}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className='space-y-2 text-sm'>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Số tiền thanh toán</span>
          <Input
            value={formatCurrency(paidAmount)}
            onChange={(event) => {
              const value = normalizeNumber(event.target.value)
              if (value >= totals.total) {
                onPaidAmountChange(totals.total)
                onPaymentStatusChange('3_PAID')
              } else {
                onPaidAmountChange(value)
              }
            }}
            className='h-8 w-28 rounded-full text-right text-xs'
            inputMode='numeric'
            disabled={isReadOnly || paymentStatus !== '2_PARTIALLY_PAID'}
          />
        </div>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Số tiền ghi nợ</span>
          <span className='font-semibold text-foreground'>
            {formatCurrency(totals.debt)}đ
          </span>
        </div>
        <div className='flex justify-end'>
          <button
            type='button'
            className='text-xs text-primary underline-offset-2 hover:underline'
            onClick={() => setQrOpen(true)}
          >
            Hiển thị QR
          </button>
        </div>
      </div>

      <PurchaseOrderQrDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        supplierId={supplierId}
        amount={paidAmount}
        orderCode={orderCode}
      />

      <Separator />

      {isOrdered && (
        <Button
          type='button'
          className='h-9 w-full rounded-xl'
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          Nhập kho (F9)
        </Button>
      )}

      <Textarea
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder='Ghi chú đơn nhập hàng'
        className='min-h-[120px] rounded-xl'
        disabled={isReadOnly}
      />
    </div>
  )
}
