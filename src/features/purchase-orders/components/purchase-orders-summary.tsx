import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { formatCurrency, normalizeNumber } from '../data/utils'
import { type PaymentStatus } from '../data/types'
import type { Supplier } from '@/services/supabase/database/repo/suppliersRepo'
import { SupplierSwitcher } from './supplier-switcher'

type PurchaseOrdersSummaryProps = {
  suppliers: Supplier[]
  supplierId: string
  onSupplierChange: (supplierId: string) => void
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
  onSaveDraft: () => void
  onSubmit: () => void
  isSubmitting: boolean
  readOnly?: boolean
}

const PAYMENT_OPTIONS: Array<{ label: string; value: PaymentStatus }> = [
  { label: 'Đã thanh toán', value: '3_PAID' },
  { label: 'Thanh toán 1 phần', value: '2_PARTIALLY_PAID' },
  { label: 'Ghi nợ', value: '1_UNPAID' },
]

export function PurchaseOrdersSummary({
  suppliers,
  supplierId,
  onSupplierChange,
  totals,
  orderDiscount,
  onOrderDiscountChange,
  paymentStatus,
  onPaymentStatusChange,
  paidAmount,
  onPaidAmountChange,
  notes,
  onNotesChange,
  onSaveDraft,
  onSubmit,
  isSubmitting,
  readOnly = false,
}: PurchaseOrdersSummaryProps) {
  return (
    <div className='space-y-4 rounded-xl border bg-card p-4 shadow-sm h-full'>
      <SupplierSwitcher
        suppliers={suppliers}
        activeSupplierId={supplierId}
        onChange={onSupplierChange}
        disabled={readOnly}
      />

      <Separator />

      <div className='space-y-2 text-sm'>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Tổng tiền</span>
          <span className='font-semibold text-foreground'>
            {formatCurrency(totals.subtotal)}đ
          </span>
        </div>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Chiết khấu</span>
          <Input
            value={orderDiscount}
            onChange={(event) => onOrderDiscountChange(normalizeNumber(event.target.value))}
            className='h-8 w-28 rounded-full text-right text-xs'
            disabled={readOnly}
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
              onClick={() => onPaymentStatusChange(option.value)}
              disabled={readOnly}
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
            value={paidAmount}
            onChange={(event) => onPaidAmountChange(normalizeNumber(event.target.value))}
            className='h-8 w-28 rounded-full text-right text-xs'
            disabled={readOnly}
          />
        </div>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Số tiền ghi nợ</span>
          <span className='font-semibold text-foreground'>
            {formatCurrency(totals.debt)}đ
          </span>
        </div>
      </div>
      <Separator />
      <div className='flex gap-2'>
        <Button
          type='button'
          variant='outline'
          className='h-9 flex-1 rounded-xl'
          onClick={onSaveDraft}
          disabled={isSubmitting || readOnly}
        >
          Lưu nháp (F1)
        </Button>
        <Button
          type='button'
          className='h-9 flex-1 rounded-xl'
          onClick={onSubmit}
          disabled={isSubmitting || readOnly}
        >
          Nhập hàng (F9)
        </Button>
      </div>

      <Textarea
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder='Ghi chú đơn nhập hàng'
        className='min-h-[120px] rounded-xl'
        disabled={readOnly}
      />
    </div>
  )
}
